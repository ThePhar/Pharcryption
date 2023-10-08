import { onMount, type Component } from "solid-js";

import LoginWindow from "./LoginWindow";
import Desktop from "./Desktop";

import PharcryptionState from "../PharcryptionState";
import { GamePhase } from "../enums/GamePhase";

const Application: Component = () => {
    // Only expose the PharcryptionState object in development mode.
    if (import.meta.env.MODE === "development") {
        // @ts-ignore
        window.PharcryptionState = PharcryptionState;
    }

    return (
        <>
            <LoginWindow />
            <div 
                style={{
                    position: "absolute",
                    top: "50%",
                    color: "white",
                    left: "50%",
                }}
                hidden={PharcryptionState.state.phase() === GamePhase.DISCONNECTED || PharcryptionState.state.ready()}
            >
                Logging In...
            </div>
            <Desktop />
        </>
    )
};

export default Application;
