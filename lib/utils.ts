import crypto from "crypto";

const sha256Hash = crypto.createHash('sha256');

export function hashObject(o: Object): string {
    const sortedKeys = Object.keys(o).sort();
    const sortedObject = {};
    for (const key of sortedKeys) {
        Object.assign(sortedObject, { [key]: o[key] });
    }
    return sha256Hash.copy().update(JSON.stringify(sortedObject)).digest('hex');
}
