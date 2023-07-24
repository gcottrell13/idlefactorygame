export function formatNumber(n: number | null | undefined) {
    n ??= 0;
    if (n > 1e6) {
        return n.toPrecision(3);
    }
    return (Math.round(n * 100) / 100).toFixed(2);
}
