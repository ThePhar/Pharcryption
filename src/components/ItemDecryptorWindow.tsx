import { Component, For, Setter, Show, createSignal } from "solid-js";

import Window from "./Window";
import PharcryptionState, { ItemDataTable } from "../PharcryptionState";

import "../stylesheets/ItemDecryptorWindow.css";
import file_unlocker from "../assets/file_unlocker.png";
import { GamePhase } from "../enums/GamePhase";

import click from "../assets/click.wav";
import error from "../assets/error.wav";

type PharcryptionWindowProps = {
    hidden: boolean;
    onclose: () => void;
};

const clickSound = new Audio(click);
clickSound.volume = 0.2;
const errorSound = new Audio(error);
errorSound.volume = 0.2;

const ItemDecryptorWindow: Component<PharcryptionWindowProps> = (props) => {

    const [block, setBlock] = createSignal(0);
    const [lockButtons, setLockButtons] = createSignal(false);

    return (
        <Window width={720} title="ItemDecryptor" icon={file_unlocker} hidden={props.hidden} onclose={props.onclose}>
            <div class="ItemDecryptorWindow">
                <div class="sidebar">
                    <For each={Object.entries(PharcryptionState.state.itemDataTable())}>
                        {([blockId, items]) => {
                            const totalItems = Object.entries(items).length;
                            let decryptedItems = 0;
                            for (const item of Object.values(items)) {
                                if (item.unlocked) {
                                    decryptedItems++;
                                }
                            }

                            return (
                                <div 
                                    class={"block_row " + (blockId === block().toString() ? "active" : "")}
                                    data-block={blockId}
                                    onclick={(event) => {
                                        event.preventDefault();
                                        clickSound.play();
                                        setBlock(parseInt(blockId));
                                    }}
                                >
                                    <div>Block {parseInt(blockId) + 1}</div>
                                    <div>{decryptedItems}/{totalItems} Decrypted</div>
                                </div>
                            )
                        }}
                    </For>
                </div>
                <div class="mainbar">
                    <h2>Block <span>{block() + 1}</span> - Encrypted Items</h2>
                    <div class="items">
                        <table class="item_table">
                            <thead>
                                <tr>
                                    <th>Player</th>
                                    <th>Game</th>
                                    <th>Item</th>
                                    <th>Cost</th>
                                    <th>Decrypt</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For each={Object.entries(PharcryptionState.state.itemDataTable()[block()])}>
                                    {([location, item]) => {
                                        let visible = false;
                                        let purchasable = false;

                                        if (block() === 0) {
                                            visible = true;
                                            purchasable = true;
                                        } else if (PharcryptionState.state.decrypted()) {
                                            visible = true;
                                            purchasable = true;
                                        } else if (PharcryptionState.state.phase() === GamePhase.POST_GAME) {
                                            visible = true;
                                        } else {
                                            if (item.hinted) {
                                                visible = true;
                                            } 

                                            const percentageNeeded = PharcryptionState._client.data.slotData.percentage;
                                            const previousBlock = PharcryptionState.state.itemDataTable()[block() - 1];
                                            const totalItemsInPreviousBlock = Object.entries(previousBlock).length;
                                            let decryptedItemsInPreviousBlock = 0;
                                            for (const item of Object.values(previousBlock)) {
                                                if (item.unlocked) {
                                                    decryptedItemsInPreviousBlock++;
                                                }
                                            }
    
                                            const percentageDecrypted = (decryptedItemsInPreviousBlock / totalItemsInPreviousBlock) * 100;
                                            if (percentageDecrypted >= percentageNeeded) {
                                                purchasable = true;
                                                visible = true;
                                            }
                                        }

                                        return (
                                            <tr>
                                                <td>{visible ? item.player : <span class="unknown">???</span>}</td>
                                                <td>{item.game}</td>
                                                <td>{visible ? item.name : <span class="unknown">???</span>}</td>
                                                <td style={{"text-align": "center"}}>{item.cost}</td>
                                                <td>
                                                    <Show when={purchasable} fallback={<div class="unknown" style={{"text-align": "center"}}>Not Decryptable</div>}>
                                                        <Show when={!item.unlocked} fallback={<div style={{color: "gray", "text-align": "center"}}>Decrypted</div>}>
                                                            <button 
                                                                class="decrypt_button"
                                                                disabled={
                                                                    lockButtons()
                                                                }
                                                                onclick={() => {
                                                                    attemptDecrypt(block(), parseInt(location), setLockButtons)
                                                                }}
                                                            >
                                                                Decrypt Me!
                                                            </button>
                                                        </Show>
                                                    </Show>
                                                </td>
                                            </tr>
                                        );
                                    }}
                                </For>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Window>
    );
};

function attemptDecrypt(block: number, location: number, setLockButtons: Setter<boolean>) {
    setLockButtons(true);
    const pharcoinsAvailable = PharcryptionState.state.pharcoins() - PharcryptionState.state.spentPharcoins();

    if (pharcoinsAvailable >= PharcryptionState.state.itemDataTable()[block][location].cost) {
        PharcryptionState._client.send({ 
            cmd: "Set", 
            key: "Pharcryption__SpentPharcoins",
            operations: [{
                operation: "add",
                value: PharcryptionState.state.itemDataTable()[block][location].cost,
            }],
            default: 0,
            want_reply: false,
        });
        PharcryptionState._client.locations.check(location);
        setTimeout(() => {
            setLockButtons(false);
        }, 1000);
        clickSound.play();
    } else {
        setLockButtons(false);
        errorSound.play();
    }
}

export default ItemDecryptorWindow;
