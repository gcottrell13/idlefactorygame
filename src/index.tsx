import { App } from "./components/App";
import { VERSION } from "./version";
import React from "react";
import { createRoot } from "react-dom/client";
import "./css.css";

const TICKS_PER_SECOND = 20;

const root = createRoot(document.getElementById("view")!);
root.render(<App ticksPerSecond={TICKS_PER_SECOND} />);

document.title = "idlefactorygame v" + VERSION;
document.addEventListener(
    "mousedown",
    function (event) {
        if (event.detail > 1) {
            event.preventDefault();
            // of course, you still do not know what you prevent here...
            // You could also check event.ctrlKey/event.shiftKey/event.altKey
            // to not prevent something useful.
        }
    },
    false,
);
