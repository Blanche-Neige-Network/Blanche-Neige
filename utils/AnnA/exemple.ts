import { TCPStringSocket, TCPStringListener } from "./mod.ts";

const server = TCPStringListener.listen("127.0.0.1", 3333);

(async () => {
    for await (const client of server) {
        while (true) {
            let message = await client.read();
            if (!message) break;
            console.log(message);
        }
    }
})()

const client = await TCPStringSocket.connect("127.0.0.1", 3333);

for (let message of ["Hello", "World", "!!!"]) {
    await client.write(message);
}