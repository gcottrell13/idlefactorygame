export function formatNumber(n: number | null | undefined) {
    n ??= 0;
    if (n > 1e6) {
        return n.toPrecision(3);
    }
    let value = (Math.round(n * 100) / 100).toFixed(2);
    if (value.endsWith('.00')) return Math.floor(n);
    return value.substring(0, value.indexOf('.') + 3);
}

export function formatSeconds(n: number) {
    let seconds = Math.floor(n);
    let minutes = "00";
    let hours = "00";
    if (seconds >= 3600) {
        hours = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        seconds = seconds % 3600;
    }
    if (seconds >= 60) {
        minutes = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        seconds = seconds % 60;
    }
    return `${hours}:${minutes}:${seconds.toString().padStart(2, "0")}`;
}
