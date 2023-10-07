import { App } from "./components/App";
import { VERSION } from "./version";
import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css.scss";

const TICKS_PER_SECOND = 20;

const root = createRoot(document.getElementById("view")!);
root.render(<App ticksPerSecond={TICKS_PER_SECOND} />);

document.title = "idlefactorygame v" + VERSION().join(".");
