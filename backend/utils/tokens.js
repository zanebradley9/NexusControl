import crypto from "crypto";
const apiKey = generateApiKey();

export function generateToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
}

export function generateApiKey() {
    return (
        "nc_" +
        crypto.randomBytes(24).toString("hex")
    );
}

export function generateSessionId() {
    return crypto.randomUUID();
}

export function generateVerificationCode() {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
}