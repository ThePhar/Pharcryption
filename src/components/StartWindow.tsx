import { Component, Show } from "solid-js";

import Window from "./Window";
import ohno from "../assets/oh_no.png";
import PharcryptionState from "../PharcryptionState";

type StartWindowProps = {
    hidden: boolean;
    onclose: () => void;
};

const StartWindow: Component<StartWindowProps> = (props) => {
    return (
        <Window width={240} icon={ohno} title="Start Pharcryption Service" onclose={props.onclose} hidden={props.hidden}>
            <div class="StartWindow" style={{
                padding: "8px",
                "text-align": "center",
                display: "flex",
                "flex-direction": "column",
                gap: "8px"
            }}>
                <div>Are you sure you want to start Pharcryption? The timer will immediately begin.</div>
                <Show when={PharcryptionState._client.data.slotData.password !== ""}>
                    <input id="start_password" type="password" placeholder="Pharcryption Start Password" />
                </Show>
                <button onclick={() => {
                    const password = (document.getElementById("start_password") as HTMLInputElement | undefined)?.value;
                    PharcryptionState.start(password ?? "");
                }}> Start Pharcryption Service </button>

                <span></span>
            </div>
        </Window>
    )
};

export default StartWindow;
