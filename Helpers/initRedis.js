                                        // Redis-commander is a Web GUI for redis same like MongoCompass & MySQL Workbench
                                        // for more detail on Redis-commander :- https://youtu.be/QbldfY1enRU



                                        // Redis client connection the singleton way :- https://youtu.be/4a43nO5x0b0

const redis = require("redis");

let redisPort = 6379;                                       // 6379 is redis default port
let redisHost = "127.0.0.1";                                // localhost = 127.0.0.1
const client = redis.createClient({                         // only createClient() is for localhost
    port: redisPort,
    host: redisHost,
});

(async () => {
    // Connect to redis server
    await client.connect();
})();

// Connect Event / CallBack
client.on("connect", () => {
    console.log("Client connected to redis...")
})

// Ready Event
client.on("ready", () => {
    console.log("Client connected to redis & ready to use...")
})

// Error Event
client.on("error", (err) => {
    console.log(err.message)
})

// Disconnect Event
client.on("end", () => {
    console.log("Client disconnected from redis")
})

// Close Redis (SIGINT Event)
process.on("SIGINT", () => {                                // SIGINT Event will fire when we press ctrl+c
    client.quit();
    console.log(" redis client quit");
});

module.exports = client