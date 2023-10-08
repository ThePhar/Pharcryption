import { Show, type Component } from "solid-js";

import "../stylesheets/Window.css";

import click from "../assets/click.wav";

export interface WindowProps {
    width: number;
    height?: number;
    title?: string;
    id?: string;
    children?: any;
    hidden?: boolean;
    icon?: string;
    onclose?: () => void;
}

const Window: Component<WindowProps> = (props) => {
    const clickSound = new Audio(click);
    clickSound.volume = 0.2;

    return (
        <div
            id={props.id} 
            class="Window" 
            hidden={props.hidden}
            style={{ width: `${props.width}px`, height: !!props.height ? `${props.height}px` : "" }}
        >
            <div class="Window__title-bar">
                <img src={props.icon} />
                <div class="title">{props.title}</div>
                <Show when={props.onclose !== undefined} fallback={<div class="spacer"></div>}>
                    <button class="close-button" onclick={() => {
                        clickSound.play();
                        
                        if (props.onclose !== undefined) {
                            props.onclose();
                        }
                    }}>X</button>
                </Show>
            </div>

            <div class="Window__body">
                {props.children}
            </div>
        </div>
    );
};

export default Window;
