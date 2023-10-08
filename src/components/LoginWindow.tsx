import { createSignal, type Component, onMount } from "solid-js";

import PharcryptionState from "../PharcryptionState";
import Window from "./Window";
import { GamePhase } from "../enums/GamePhase";

import "../stylesheets/LoginWindow.css";
import pkgJSON from "../../package.json";
import apSmall from "../assets/ap_small.png";

const LoginWindow: Component = () => {
    const [lockFields, setLockFields] = createSignal(false);

    onMount(() => {
        const element = document.querySelector("#LoginWindow") as HTMLElement;
        element.style.left = `${Math.round((window.innerWidth - element.offsetWidth) / 2)}px`;
        element.style.top = `${Math.round((window.innerHeight - element.offsetHeight) / 2)}px`;
    });

    return (
        <Window 
            width={512} 
            title="Logon to ArchipelaOS - Pharcryption Client" 
            id="LoginWindow"
            hidden={PharcryptionState.state.phase() !== GamePhase.DISCONNECTED}
            icon={apSmall}
        >
            <div class={"LoginBanner "} />

            <form class="LoginForm">
                <div class="LoginForm__field">
                    <label>Server Hostname: </label>
                    <input 
                        id="hostname" 
                        type="text" 
                        placeholder="wss://archipelago.gg:38281" 
                        required 
                        disabled={lockFields()} 
                    />
                </div>

                <div class="LoginForm__field">
                    <label>Player Username: </label>
                    <input id="username" type="text" placeholder="Player1" required disabled={lockFields()} />
                </div>

                <div class="LoginForm__field">
                    <label>Room Password: </label>
                    <input id="password" type="password" placeholder="" disabled={lockFields()} />
                </div>

                {/* <div class="LoginForm__field">
                    <label></label>
                    <input id="alt-art" type="checkbox" />
                    <span>
                        Log on using <span style={{"text-decoration": "underline"}}>placeholder</span> art assets 
                        instead.
                    </span>
                </div> */}

                <div class="LoginForm__button-row">
                    <footer>
                        <span style={{"line-height": "12px"}}>
                            v{pkgJSON.version} Build<br />
                            <span style={{"text-decoration": "underline"}}>Pharcryption</span>&nbsp; was created by <a href="https://github.com/ThePhar/">Zach &quot;Phar&quot; 
                            Parks</a>, so you know who to blame.
                        </span>
                    </footer>
                    
                    <button disabled={lockFields()} onclick={(event) => {
                        event.preventDefault();

                        const hostname = (document.getElementById("hostname") as HTMLInputElement).value;
                        const username = (document.getElementById("username") as HTMLInputElement).value;
                        const password = (document.getElementById("password") as HTMLInputElement).value;

                        setLockFields(true);
                        PharcryptionState.connect(hostname, username, password)
                            .then(() => setLockFields(false));
                    }}>
                        {lockFields() ? "Connecting..." : "Connect"}
                    </button>
                </div>
            </form>
        </Window>
    )
};

export default LoginWindow;
