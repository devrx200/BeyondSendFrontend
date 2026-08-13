const encodeBase64 = (rowContent) => {
    if (typeof rowContent !== "string") return "";

    if (typeof Buffer !== "undefined") {
        return Buffer.from(rowContent, "utf8").toString("base64");
    }

    const bytes = new TextEncoder().encode(rowContent);
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
};

const isBase64 = (str) => {
    if (typeof str !== "string" || !str.trim()) return false;
    const trimmed = str.trim();
    if (trimmed.startsWith("<") || trimmed.startsWith("{") || trimmed.startsWith("[")) return false;
    if (!/^[A-Za-z0-9+/=]+$/.test(trimmed) || trimmed.length % 4 !== 0) return false;
    try {
        if (typeof Buffer !== "undefined") {
            const decoded = Buffer.from(trimmed, "base64").toString("utf8");
            return Buffer.from(decoded, "utf8").toString("base64") === trimmed;
        }
        const binary = atob(trimmed);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        const decoded = new TextDecoder("utf-8").decode(bytes);
        return encodeBase64(decoded) === trimmed;
    } catch {
        return false;
    }
};

const decodeBase64 = (base64RowContent) => {
    if (typeof base64RowContent !== "string" || !base64RowContent) {
        return "";
    }

    if (!isBase64(base64RowContent)) {
        return base64RowContent;
    }

    try {
        if (typeof Buffer !== "undefined") {
            return Buffer.from(base64RowContent, "base64").toString("utf8");
        }

        const binary = atob(base64RowContent);
        const bytes = Uint8Array.from(
            binary,
            (char) => char.charCodeAt(0)
        );

        return new TextDecoder("utf-8").decode(bytes);
    } catch {
        return base64RowContent;
    }
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = { encodeBase64, decodeBase64 };
}

export { encodeBase64, decodeBase64 };