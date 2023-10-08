import { Component, For, JSX, Show, createSignal } from "solid-js";
import { Client as ArchipelagoClient, ITEMS_HANDLING_FLAGS } from "archipelago.js";

import Window from "./Window";

import "../stylesheets/APMessengerWindow.css";
import apmessenger from "../assets/apmessenger.png";
import PharcryptionState from "../PharcryptionState";

import click from "../assets/click.wav";
import msg from "../assets/msg.wav";

const clickSound = new Audio(click);
clickSound.volume = 0.2;

const msgSound = new Audio(msg);
msgSound.volume = 0.2;

type APMessengerProps = {
    hidden: boolean;
    onclose: () => void;
};

const APMessengerWindow: Component<APMessengerProps> = (props) => {
    const [chatClient, _] = createSignal<ArchipelagoClient>(new ArchipelagoClient());
    const [chatMessages, setChatMessages] = createSignal<JSX.Element[]>([]);
    const [connected, setConnected] = createSignal<boolean>(false);
    const [lockFields, setLockFields] = createSignal<boolean>(false);

    const connect = async (username: string, password: string) => {
        const regex = /^(\/connect )?((wss?):\/\/)?([\w.]+)(:(-?[0-9]+))?/;
        const results = regex.exec(PharcryptionState._client.uri as string);

        // Invalid connection string.
        if (!results) {
            throw new Error("Invalid connection string for APMessenger???");
        }

        const protocol = results[3] as "ws" | "wss" | undefined;
        const hostname = results[4];
        const port = results[6] ? parseInt(results[6]) : 38281;

        if (username === PharcryptionState._client.players.name(PharcryptionState._client.data.slot)) {
            alert("You can't connect to APMessenger as the Pharcryption client! Use your playing slot instead.");
            return;
        }

        // Listen for chat messages.
        chatClient().addListener("PrintJSON", (packet, message) => {
            let element: JSX.Element = <div><span class="name">{message}</span></div>;
            
            switch (packet.type) {
                case "Chat":                   
                    element = (
                        <div>
                            <span class="name">&lt;<b>{chatClient().players.alias(packet.slot)}</b>&gt; says:</span>
                            <div class="quote">{message}</div>
                        </div>
                    );
                    break;
                case "ServerChat":
                    element = (
                        <div>
                            <span class="name">&lt;<b>Server</b>&gt; says:</span>
                            <div class="quote">{message}</div>
                        </div>
                    );
                    break;
                case "Join":
                    element = (
                        <div>
                            <span class="name">{chatClient().players.alias(packet.slot)} has joined the room.</span>
                        </div>
                    );
                    break;

                // Do not parse these messages.
                case "ItemCheat":
                case "ItemSend":
                case "Hint":
                    return;

                default:
                    break;
            }

            // TODO: Add colors!
            setChatMessages((messages) => [...messages, element]);

            // Scroll to the bottom of the chat.
            const chatBox = document.querySelector(".messages") as HTMLElement;
            chatBox.scrollTop = chatBox.scrollHeight;
        });

        clickSound.play();

        try {
            await chatClient().connect({
                game: "",
                items_handling: ITEMS_HANDLING_FLAGS.LOCAL_ONLY,
                name: username, // TODO: Change this to the player's username.
                hostname,
                protocol,
                port,
                password, // TODO: CHange this to the room's password.
                tags: ["TextOnly", "APMessenger"],
            });

            setConnected(true);
        } catch (error: any) {
            const errorMessage = typeof (error[0]) === "object"
            ? `Unable to connect to ${error[0]["target"]["url"]}`
            : error[0];

            alert("Failed to connect: " + errorMessage);
            chatClient().disconnect();
            return;
        }
    }

    const login = (
        <div class="login_box">
            <h3>Log into APMessenger</h3>
            <div class="apm_block">
                <label class="apm_label">Slot Name: </label>
                <input id="apm_username" type="text" placeholder="Your Actual Slot Name" disabled={lockFields()} />  
            </div>
            <div class="apm_block">
                <label class="apm_label">Room Password: </label>
                <input id="apm_password" type="password" placeholder="" disabled={lockFields()} />  
            </div>
            <button 
                disabled={lockFields()}
                onclick={(e) => {
                    e.preventDefault();
                    setLockFields(true);

                    const username = (document.getElementById("apm_username") as HTMLInputElement).value;
                    const password = (document.getElementById("apm_password") as HTMLInputElement).value;
                    connect(username, password)
                        .then(() => setLockFields(false));
                }}
            >
                Login
            </button>

        </div>
    );

    return (
        <Window width={480} title="APMessenger" icon={apmessenger} hidden={props.hidden} onclose={props.onclose}>
            <div class="APMessengerWindow">
                <Show when={connected()} fallback={login}>
                    <div class="chat_box">
                        <div class="chat_header">
                            Logged in as: {chatClient().players.name(chatClient().data.slot)}
                        </div>
                        <div class="messages">
                            <For each={chatMessages()}>
                                {(message) => message}
                            </For>
                        </div>
                        <div class="textfield">
                            <textarea id="chat_enter" onkeypress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();

                                    // Do not send empty messages or messages with only whitespace.
                                    if ((document.getElementById("chat_enter") as HTMLInputElement).value.trim().length === 0) {
                                        return;
                                    }

                                    const message = (document.getElementById("chat_enter") as HTMLInputElement).value;
                                    chatClient().say(message.trim());

                                    (document.getElementById("chat_enter") as HTMLInputElement).value = "";
                                }
                            }}></textarea>
                            
                            <div style={{padding: "4px 8px"}}>
                                Connected to {PharcryptionState._client.uri}
                            </div>
                        </div>
                    </div>
                </Show>
            </div>
        </Window>
    );
};

export default APMessengerWindow;
