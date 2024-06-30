import { App } from "./components/App";
import { VERSION } from "./version";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css.scss";
import Decimal from "decimal.js";

const TICKS_PER_SECOND = 20;

const root = createRoot(document.getElementById("view")!);
root.render(<App ticksPerSecond={TICKS_PER_SECOND} />);

// ------------------------------------------------------------
// make sure the decimals serialize the way I want them to
function toJson(this: Decimal) {
    return `big=${this.toString()}`;
}
(Decimal as any).prototype.toJSON = toJson;
// ------------------------------------------------------------

document.title = "idlefactorygame v" + VERSION().join(".");
