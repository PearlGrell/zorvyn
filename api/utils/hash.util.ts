import crypto from "crypto";

function hash(password: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
    return { salt, hash };
}

function verify(password: string, salt: string, hash: string) {
    const hash2 = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
    return hash === hash2;
}

export default {
    hash,
    verify
}