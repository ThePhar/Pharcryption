import { createSignal, type Component, Show } from "solid-js";

import PharcryptionState from "../PharcryptionState";
import { GamePhase } from "../enums/GamePhase";
import PharcryptionWindow from "./PharcryptionWindow";

import "../stylesheets/Desktop.css";
import { topZIndex, incrementTopZIndex } from "../PharcryptionState";

import lock from "../assets/lock.png";
import apmessenger from "../assets/apmessenger.png";
import fileunlocker from "../assets/file_unlocker.png";
import ohno from "../assets/oh_no.png";
import Icon from "./Icon";
import ItemDecryptorWindow from "./ItemDecryptorWindow";
import APMessengerWindow from "./APMessengerWindow";
import StartWindow from "./StartWindow";

import click from "../assets/click.wav";

const Desktop: Component = () => {
    const [showPharcryptor, setShowPharcryptor] = createSignal(false);
    const [showItemDecryptor, setShowItemDecryptor] = createSignal(false);
    const [showAPMessenger, setShowAPMessenger] = createSignal(false);
    const [showStartApp, setShowStartApp] = createSignal(false);

    const clickSound = new Audio(click);
    clickSound.volume = 0.2;

    setInterval(() => {
        const currentTimeElement = document.querySelector("#current_time") as HTMLElement;
        const now = new Date();
        currentTimeElement.innerText = 
            `${now.getHours().toString().padStart(2, "0")}:` +
            `${now.getMinutes().toString().padStart(2, "0")}:` +
            `${now.getSeconds().toString().padStart(2, "0")}\n` +
            `${now.getDate().toString().padStart(2, "0")}/` +
            `${(now.getMonth() + 1).toString().padStart(2, "0")}/` +
            `${now.getFullYear()}`;
    }, 1000);

    return (
        <div 
            class="Desktop" 
            hidden={
                PharcryptionState.state.phase() === GamePhase.DISCONNECTED || (
                    PharcryptionState.state.phase() !== GamePhase.DISCONNECTED && !PharcryptionState.state.ready()
                )
            }
        >
            <Show when={PharcryptionState.state.ready()}>
                <PharcryptionWindow hidden={!showPharcryptor()} onclose={() => setShowPharcryptor(false)}/>
                <ItemDecryptorWindow hidden={!showItemDecryptor()} onclose={() => setShowItemDecryptor(false)}/>
                <APMessengerWindow hidden={!showAPMessenger()} onclose={() => setShowAPMessenger(false)}/>
                <StartWindow hidden={!showStartApp() || PharcryptionState.state.phase() !== GamePhase.PRE_GAME} onclose={() => setShowStartApp(false)}/>
            </Show>

            <div>
                <Icon 
                    icon={ohno} 
                    title="NotAVirus.exe" 
                    x={100} 
                    y={0} 
                    onclick={() => {
                        setShowStartApp(true);
                        clickSound.play();

                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".StartWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }}
                    hidden={PharcryptionState.state.phase() !== GamePhase.PRE_GAME}
                />
                <Icon 
                    icon={apmessenger} 
                    title="APMessenger" 
                    x={0} 
                    y={0} 
                    onclick={() => {
                        setShowAPMessenger(true);
                        clickSound.play();

                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".APMessengerWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }}
                    hidden={false}
                />
                <Icon 
                    icon={lock} 
                    title="Pharcryptor.exe" 
                    x={0.5} 
                    y={100} 
                    onclick={() => {
                        setShowPharcryptor(true);
                        clickSound.play();

                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".PharcryptionWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }} 
                    hidden={PharcryptionState.state.phase() !== GamePhase.IN_PROGRESS && PharcryptionState.state.phase() !== GamePhase.POST_GAME}
                />
                <Icon 
                    icon={fileunlocker} 
                    title="ItemDecryptor.exe" 
                    x={0} 
                    y={200} 
                    onclick={() => {
                        setShowItemDecryptor(true);
                        clickSound.play();

                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".ItemDecryptorWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }} 
                    hidden={
                        PharcryptionState.state.phase() !== GamePhase.IN_PROGRESS && PharcryptionState.state.phase() !== GamePhase.POST_GAME
                    }
                />
            </div>

            <div id="background" hidden={
                PharcryptionState.state.phase() !== GamePhase.IN_PROGRESS && PharcryptionState.state.phase() !== GamePhase.POST_GAME
            }>
                <div class="content">
                    <h2>Oopsie! Your important items are encrypted.</h2>
                    <p>
                        If you see this text, it means that your items have been encrypted. Please find an application file
                        named <span class="highlight">"Pharcryptor.exe"</span> on your computer.
                    </p>
                    <p>
                        Run the application and follow the instructions.
                    </p>
                </div>
            </div>

            <div class="Desktop__taskbar">
                <div class="Desktop__taskbar__start-button">
                    <div class="Desktop__taskbar__start-button--logo"></div>
                </div>
                <div class="Desktop__taskbar__applications">
                    <div class="active" hidden={!showAPMessenger()} onclick={(e) => {
                        clickSound.play();
                        
                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".APMessengerWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }}>
                        <img src={apmessenger} />
                        APMessenger
                    </div>
                    <div class="active" hidden={!showPharcryptor()} onclick={(e) => {
                        clickSound.play();
                        
                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".PharcryptionWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }}>
                        <img src={lock} />
                        Pharcryptor
                    </div>
                    <div class="active" hidden={!showItemDecryptor()} onclick={(e) => {
                        clickSound.play();
                        
                        // Make window on top.
                        const apMessengerWindowElement = document.querySelector(".ItemDecryptorWindow")?.parentElement?.parentElement as HTMLElement;
                        console.log(apMessengerWindowElement);
                        incrementTopZIndex();
                        apMessengerWindowElement.style.zIndex = topZIndex().toString();
                    }}>
                        <img src={fileunlocker} />
                        ItemDecryptor
                    </div>
                </div>
                <div class="Desktop__taskbar__system-tray">
                    <div id="pharcoin_icon">
                        <span id="pharcoin_amount">{PharcryptionState.state.pharcoins() - PharcryptionState.state.spentPharcoins()}</span>
                    </div>
                    <span id="current_time">--:--:--<br />DD/MM/YYYY</span>
                </div>
            </div>
        </div>
    );
}

export default Desktop;
