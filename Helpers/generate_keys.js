                            // Super Secret Key for signing JWT :- https://youtu.be/3v5UU7F0tMg

        // For Refresh Token both keys generation required
const crypto = require("crypto");                               // in-build module

// Generate a Key
const key1 = crypto.randomBytes(32).toString("hex")             // 32 is a number of Bytes
const key2 = crypto.randomBytes(32).toString("hex")

console.table({ key1, key2 })