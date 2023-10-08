/* @refresh reload */
import { render } from "solid-js/web";

import Application from "./components/Application";

// Normalize CSS
import "normalize.css/normalize.css";
import "./index.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Check index.html if it is defined.",
    );
}

render(() => <Application />, root!);
