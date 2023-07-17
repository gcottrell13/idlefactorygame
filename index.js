"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.newfunction = void 0;
const jquery_1 = __importDefault(require("jquery"));
function newfunction(e) {
    const input = (0, jquery_1.default)("#input");
    const view = (0, jquery_1.default)('#view');
    view.text(String(input.val()));
}
exports.newfunction = newfunction;
(_a = document.getElementById("input")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", newfunction);
