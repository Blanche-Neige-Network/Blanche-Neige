import { askQueue } from "../types/all.ts"

export const decoder = new TextDecoder()
export const encoder = new TextEncoder();

export function randomID(length: number) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export class Socket {
    public readonly reader: Deno.Reader;
    public readonly writer: Deno.Writer;
    private queue:askQueue = []

    constructor(reader: Deno.Reader, writer: Deno.Writer) {
        this.reader = reader;
        this.writer = writer;
    }

    public async read(size: number): Promise<null | [string, Uint8Array]> {
        let bytes = new Uint8Array(4 + size),
            n = await this.reader.read(bytes)

        if (n == null) return null;
                
        let id = decoder.decode(bytes.subarray(0, 4)),
            buffer = bytes.subarray(4);
        
        // Check if the id is in the queue
        if(this.queue.find(x => x.id = id)){
            // Data is the string converted from the buffer
            (this.queue.find(x => x.id = id)).data = decoder.decode(buffer);
            (this.queue.find(x => x.id = id)).done = true;
            return null;
        } else {
            return [id, buffer];
        }
    }

    public async write(buffer: Uint8Array, id = randomID(4)) {
        let bytes = new Uint8Array(4 + buffer.byteLength);
        encoder.encodeInto(id, bytes.subarray(0, 4));
        bytes.set(buffer, 4);

        await this.writer.write(bytes);
    }

    public async writeString(string: string, size?: number, idValue?:string ) {
        let subbytes = encoder.encode(string),
            length = size ? size : subbytes.length,
            id = idValue ? idValue : randomID(4);

        let bytes = new Uint8Array(length);
        bytes.set(subbytes);

        await this.write(bytes, id);
    }

    public async ask(string: string, size?: number, id = randomID(4)) : Promise<string | null> {
        this.queue.push({
            id: id,
            done: false,
            data: null
        })
        this.writeString(string, size, id);
        let count = 0;
        while (!(this.queue.find(x => x.id = id)).done) {
            await new Promise(resolve => setTimeout(resolve, 10));
            count++;
            if(count > 100){
                return null
            }
        }
        let k = this.cleaner((this.queue.find(x => x.id = id)).data);
        //delete the element from the queue
        this.queue = this.queue.filter(x => x.id != id)

        return k
    }

    public async close() {
        try {
            await this.writer.close();
        } catch (err) {
            console.log(err);
        }        
    }

    public cleaner(message){
        message = message.replace(/\x00/g, "");
        return message;
    }
}

export type Listener = AsyncIterable<Socket>;

export class TCPListener implements Listener {
    public readonly listener: Deno.Listener;

    constructor(listener: Deno.Listener) {
        if (listener.addr.transport != "tcp") {
            throw new Error("This is not a TCP listener.");
        }

        this.listener = listener;
    }

    public async *[Symbol.asyncIterator]() {
        for await (const conn of this.listener) {
            yield new Socket(conn, conn);
        }
    }

    public static from(hostname: string, port: number) {
        return new TCPListener(Deno.listen({ hostname, port, transport: "tcp" }));
    }
}

export async function connect(options: Deno.ConnectOptions) {
    let conn = await Deno.connect(options);
    return new Socket(conn, conn);
}