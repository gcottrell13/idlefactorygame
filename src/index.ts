import $ from "jquery";

export function newfunction(e: Event) {
    const input = $("#input");
    const view = $('#view');
    view.text(String(input.val()));
}
document.getElementById("input")?.addEventListener("change", newfunction);