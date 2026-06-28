export function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isUsername(username) {
    return /^[a-zA-Z0-9_-]{3,32}$/.test(username);
}

export function isPassword(password) {
    return (
        typeof password === "string" &&
        password.length >= 8
    );
}

export function isDiscordId(id) {
    return /^[0-9]{17,20}$/.test(id);
}

export function isApiKey(key) {
    return /^nc_[a-f0-9]{48}$/.test(key);
}

export function required(...values) {
    return values.every(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );
}
if (!required(email, password)) {
    return res.status(400).json({
        message: "Missing fields",
    });
}

if (!isEmail(email)) {
    return res.status(400).json({
        message: "Invalid email",
    });
}