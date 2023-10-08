import { Component } from "solid-js";

import "../stylesheets/Icon.css";

type IconProps = {
    onclick: () => void;
    hidden: boolean;
    icon: string;
    title: string;
    x: number;
    y: number;
};

const Icon: Component<IconProps> = (props) => {
    return (
        <div class="Icon" style={{"top": `${props.y}px`, "left": `${props.x}px`}} onclick={props.onclick} hidden={props.hidden}>
            <img src={props.icon} />
            <div class="title">{props.title}</div>
        </div>
    );
};

export default Icon;
