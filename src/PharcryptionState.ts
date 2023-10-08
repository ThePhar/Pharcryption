import { createRoot, createSignal } from "solid-js";
import { Client as ArchipelagoClient, Hint, ITEMS_HANDLING_FLAGS, SetOperationsBuilder } from "archipelago.js";

import { GamePhase } from "./enums/GamePhase";
import bootSfx from "./assets/boot.ogg";
import encrypted from "./assets/explode.wav";

const encryptedSound = new Audio(encrypted);
encryptedSound.volume = 0.2;

let receivedInitialItems = false;

export type PharcryptionSlotData = {
    "password": string;
    "percentage": number;
    "timelimit": number;
    "item_costs": {
        [block: string]: { 
            [location: string]: {
                "id": number;
                "player": number;
                "cost": number;
            };
        };
    };
};

export type ItemDataTable = {
    [block: number]: {
        [location: number]: {
            name: string;
            player: string;
            game: string;
            cost: number;
            unlocked: boolean;
            hinted: boolean;
        };
    };
};

function createGameState() {
    const [phase, setPhase] = createSignal<GamePhase>(GamePhase.DISCONNECTED);
    const [decrypted, setDecrypted] = createSignal<boolean>(false);
    const [pharcoins, setPharcoins] = createSignal<number>(0);
    const [spentPharcoins, setSpentPharcoins] = createSignal<number>(0);
    const [timelimit, setTimeLimit] = createSignal<number>(0);
    const [useBetaArt, setUseBetaArt] = createSignal<boolean>(false);
    const [itemDataTable, setItemDataTable] = createSignal<ItemDataTable>({} as ItemDataTable, { equals: false });
    const [ready, setReady] = createSignal<boolean>(false);

    function updatePhase(newPhase: GamePhase) {
        switch (newPhase) {
            case GamePhase.DISCONNECTED:
            case GamePhase.PRE_GAME:
            case GamePhase.IN_PROGRESS:
            case GamePhase.POST_GAME:
                setPhase(newPhase);
                return;

            default:
                throw new Error(`Invalid/Unknown phase: ${newPhase}`);
        }
    }

    function addPharcoins(amount: number) {
        setPharcoins(pharcoins() + amount);
    }

    function removePharcoins(amount: number) {
        setPharcoins(pharcoins() - amount);

        if (pharcoins() < 0) {
            throw new Error("Cannot have negative Pharcoins!");
        }
    }

    function toggleBetaArt() {
        setUseBetaArt(!useBetaArt());
    }

    function active() {
        return phase() === GamePhase.IN_PROGRESS;
    }

    return {
        active,
        phase,
        decrypted,
        pharcoins: pharcoins,
        spentPharcoins,
        timelimit,
        useBetaArt,
        itemDataTable,
        ready,

        _func: {
            updatePhase,
            decrypt: () => setDecrypted(true),
            addPharcoins,
            setPharcoins,
            setSpentPharcoins,
            setTimeLimit,
            toggleBetaArt,
            setItemDataTable,
            setReady,
        }
    };
}

const state = createRoot(createGameState);

// Attempt to connect to the Archipelago server.
async function attemptLogin(address: string, username: string, password: string) {
    const regex = /^(\/connect )?((wss?):\/\/)?([\w.]+)(:(-?[0-9]+))?/;
    const results = regex.exec(address);

    // Invalid connection string.
    if (!results) {
        return;
    }

    const protocol = results[3] as "ws" | "wss" | undefined;
    const hostname = results[4];
    const port = results[6] ? parseInt(results[6]) : 38281;

    if (!hostname || !username) {
        alert("You must enter a hostname and username.");
        return;
    }

    if (port <= 0 || port > 65535) {
        alert("Invalid port number.");
        return;
    }

    // Setup client events.
    client.addListener("ReceivedItems", async (packet) => {
        // Work around for bug with Archipelago.js.
        if (packet.index === 0 && receivedInitialItems) {
            return;
        } else if (packet.index === 0) {
            receivedInitialItems = true;
        }
        
        console.log("ReceivedItems", packet);
        for (const item of packet.items) {
            switch (item.item) {
                case 400_400_000: // 1 Pharcoin
                    PharcryptionState.state._func.addPharcoins(1);
                    break;

                case 400_400_001: // 2 Pharcoins
                    PharcryptionState.state._func.addPharcoins(2);
                    break;
                
                case 400_400_002: // 3 Pharcoins
                    PharcryptionState.state._func.addPharcoins(3);
                    break;
                
                case 400_400_003: // 4 Pharcoins
                    PharcryptionState.state._func.addPharcoins(4);
                    break;
                
                case 400_400_004: // 5 Pharcoins
                    PharcryptionState.state._func.addPharcoins(5);
                    break;

                case 400_400_005: // Decryption Key
                    await client.data.set(new SetOperationsBuilder("Pharcryption__Decrypted", true));
                    PharcryptionState.state._func.decrypt();
                    break;
            }
        }
    });

    client.addListener("Retrieved", (packet) => {
        if ("Pharcryption__TimeLimit" in packet.keys) {
            PharcryptionState.state._func.setTimeLimit(new Date(packet.keys["Pharcryption__TimeLimit"] as string).getTime());
        }
    });

    client.addListener("SetReply", (packet) => {
        console.log("SetReply", packet.key, packet.original_value, packet.value);

        // Update hints.
        if (packet.key === `_read_hints_0_${client.data.slot}`) {
            PharcryptionState.state._func.setItemDataTable((itemDataTable) => {
                for (const hint of packet.value as Hint[]) {
                    const location = hint.location;

                    itemDataTable[getBlockFromLocationId(location)][location] = {
                        ...itemDataTable[getBlockFromLocationId(location)][location],
                        hinted: true,
                    };
                }

                return itemDataTable;
            });
        }

        // Update spent Pharcoins.
        if (packet.key === "Pharcryption__SpentPharcoins") {
            PharcryptionState.state._func.setSpentPharcoins(packet.value as number);
        }

        // Update Timer.
        if (packet.key === "Pharcryption__TimeLimit") {
            PharcryptionState.state._func.setTimeLimit(new Date(packet.value as string).getTime());
        }

        // Start Game.
        if (packet.key === "Pharcryption__Started") {
            if (packet.value) {
                PharcryptionState.state._func.updatePhase(GamePhase.IN_PROGRESS);
            } else {
                PharcryptionState.state._func.updatePhase(GamePhase.PRE_GAME);
            }
        }

        // Update decrypted.
        if (packet.key === "Pharcryption__Decrypted" && packet.value) {
            PharcryptionState.state._func.decrypt();
        }
    });

    client.addListener("RoomUpdate", (packet) => {
        // Update checked locations.
        if (packet.checked_locations) {
            for (const location of packet.checked_locations) {
                PharcryptionState.state._func.setItemDataTable((itemDataTable) => {
                    itemDataTable[getBlockFromLocationId(location)][location] = {
                        ...itemDataTable[getBlockFromLocationId(location)][location],
                        unlocked: true,
                    };

                    return itemDataTable;
                });
            }
        }
    });

    try {
        // Connect to Archipelago server.
        await client.connect({
            // TODO: Set this name correctly.
            game: "Pharcryption",
            items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
            name: username,
            hostname,
            protocol,
            port,
            password,
        });

        // Subscribe to game state updates.
        client.send({ 
            cmd: "SetNotify", 
            keys: [
                "Pharcryption__Decrypted",
                "Pharcryption__SpentPharcoins",
                "Pharcryption__TimeLimit",
                "Pharcryption__Started",
            ],
        }, {
            cmd: "Set",
            key: "Pharcryption__Decrypted",
            default: false,
            operations: [],
            want_reply: true,
        }, {
            cmd: "Set",
            key: "Pharcryption__SpentPharcoins",
            default: 0,
            operations: [],
            want_reply: true,
        }, {
            cmd: "Set",
            key: "Pharcryption__Started",
            default: false,
            operations: [],
            want_reply: true,
        }, {
            cmd: "Get",
            keys: ["Pharcryption__TimeLimit"],
        });

        // Build item data table... using a time out because of a bug with Archipelago.js. :(
        setTimeout(() => {
            PharcryptionState.state._func.setItemDataTable(() => {
                const itemDataTable: ItemDataTable = {};
                for (const blockIndex in client.data.slotData.item_costs) {
                    itemDataTable[Number.parseInt(blockIndex)] = {};
                    for (const locationIndex in client.data.slotData.item_costs[blockIndex]) {
                        const location = client.data.slotData.item_costs[blockIndex][locationIndex];
        
                        itemDataTable[Number.parseInt(blockIndex)][Number.parseInt(locationIndex)] = {
                            name: client.items.name(location.player, location.id),
                            game: client.players.game(location.player),
                            player: client.players.name(location.player),
                            cost: location.cost,
                            unlocked: client.locations.checked.includes(parseInt(locationIndex)),
                            hinted: (() => {
                                const hints = client.hints.mine;
                                for (const hint of hints) {
                                    if (hint.location === parseInt(locationIndex)) {
                                        return true;
                                    }
                                }
    
                                return false;
                            })(),
                        };
                    }
                }
    
                return itemDataTable;
            });

            // Should be loaded now!
            PharcryptionState.state._func.setReady(true);
            for (const element of document.querySelectorAll(".Window")) {
                makeWindowDraggable(element as HTMLElement);
            }
        }, 3_000);

        const bootAudio = new Audio(bootSfx);
        bootAudio.play();
    } catch (error: any) {
        const errorMessage = typeof (error[0]) === "object"
            ? `Unable to connect to ${error[0]["target"]["url"]}`
            : error[0];

        alert("Failed to connect: " + errorMessage);
        client.disconnect();
        return;
    }
}

const [topZIndex, setTopZIndex] = createSignal(0);
export const incrementTopZIndex = () => setTopZIndex(topZIndex() + 1);
export { topZIndex };

function makeWindowDraggable(element: HTMLElement) {
    let currentPositionX = 0, currentPositionY = 0, previousPositionX = 0, previousPositionY = 0;

    element.onmousedown = (event) => {
        // Make window top of z-index.
        incrementTopZIndex();
        element.style.zIndex = topZIndex().toString();
    }

    // Attach this event to the title bar.
    element.querySelector<HTMLElement>(".Window__title-bar")!.onmousedown = (event) => {
        event.preventDefault();

        previousPositionX = event.clientX;
        previousPositionY = event.clientY;
        document.onmouseup = stopDraggingElement;
        document.onmousemove = dragMouseDown;
    }

    const dragMouseDown = (event: MouseEvent) => {
        event.preventDefault();

        previousPositionX = event.clientX;
        previousPositionY = event.clientY;
        document.onmouseup = stopDraggingElement;
        document.onmousemove = dragElement;
    }

    const dragElement = (event: MouseEvent) => {
        event.preventDefault();

        currentPositionX = previousPositionX - event.clientX;
        currentPositionY = previousPositionY - event.clientY;
        previousPositionX = event.clientX;
        previousPositionY = event.clientY;

        const elementPositionXWithOffset = element.offsetLeft - currentPositionX;
        const elementPositionYWithOffset = element.offsetTop - currentPositionY;

        // Ensure that the element doesn't go off-screen.
        if (elementPositionXWithOffset < 0) {
            element.style.left = "0px";
        } else if (elementPositionXWithOffset + element.offsetWidth > window.innerWidth) {
            element.style.left = `${window.innerWidth - element.offsetWidth}px`;
        } else {
            element.style.left = `${elementPositionXWithOffset}px`;
        }

        // Ditto for the Y axis.
        if (elementPositionYWithOffset < 0) {
            element.style.top = "0px";
        } else if (elementPositionYWithOffset + element.offsetHeight > window.innerHeight) {
            element.style.top = `${window.innerHeight - element.offsetHeight}px`;
        } else {
            element.style.top = `${elementPositionYWithOffset}px`;
        }
    };

    const stopDraggingElement = () => {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function getBlockFromLocationId(locationId: number) {
    return parseInt(locationId.toString().slice(5, 7));
}

const client = new ArchipelagoClient<PharcryptionSlotData>();

const PharcryptionState = {
    _client: client,
    connect: attemptLogin,
    start: (password: string) => {
        if (client.data.slotData.password !== "" && password !== client.data.slotData.password) {
            alert("Incorrect password.");
            return;
        }

        encryptedSound.play();
        client.send({
            cmd: "Set",
            key: "Pharcryption__Started",
            default: false,
            operations: [{ operation: "replace", value: true }],
            want_reply: false,
        });

        if (client.data.slotData.timelimit) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + client.data.slotData.timelimit);
            client.send({
                cmd: "Set",
                key: "Pharcryption__TimeLimit",
                default: now.toISOString(),
                want_reply: false,
                operations: [],
            });
        }
    },
    state,
};

export default PharcryptionState;
