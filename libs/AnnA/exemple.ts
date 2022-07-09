import { connect, TCPListener, decoder } from "./main.ts";

let server = TCPListener.from("127.0.0.1", 6789);

(async () => {
    for await (let client of server) {
        console.log("New client !")
        while (true) {
            let msg = await client.read(10)
            if (!msg) break;

            let [id, content] = msg;
            console.log("GOT 1", id, content.byteLength, decoder.decode(content))
            if (decoder.decode(content).startsWith("/ping")) {
                await client.writeString("Pong !", 10, id);
                console.log("R")
            }
        }
    }
})()

let socket = await connect({ port: 6789 });

(async () => {
    console.log("S")
    while (true) {
        let msg = await socket.read(10)
        if (!msg) break;

        let [id, content] = msg;
        console.log("GOT 2", id, content)
    }
    console.log("E")
})()

setInterval(async () => {
    await socket.writeString("/ping", 10)
}, 1000)