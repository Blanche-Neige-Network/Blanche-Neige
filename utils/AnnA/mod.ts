const encoder = new TextEncoder(), decoder = new TextDecoder();

export declare namespace BlancheNeige {
    export type Socket = Deno.Reader & Deno.Writer;

    export interface Listener<Type extends Socket> {
        [Symbol.asyncIterator]: () => AsyncIterable<Type>;
    }

    export interface StringReader {
        read: () => Promise<string | null>;
    }

    export interface StringWriter {
        write: (content: string) => Promise<void>;
    }

    export type StringSocket = StringReader & StringWriter;

    export interface StringListener<Type extends StringSocket> {
        [Symbol.asyncIterator]: () => AsyncIterable<Type>;
    }
}

export class Socket implements BlancheNeige.Socket {
    public readonly read: (buffer: Uint8Array) => Promise<number | null>;
    public readonly write: (buffer: Uint8Array) => Promise<number>;

    constructor(reader: Deno.Reader, writer: Deno.Writer) {
        this.read = reader.read.bind(reader);
        this.write = writer.write.bind(writer);
    }
}

export class TCPSocket extends Socket {
    constructor(conn: Deno.Conn) {
        if (conn.remoteAddr.transport != "tcp") {
            throw new Error("This is not a TCP connection.");
        }

        super(conn, conn);
    }

    public static async connect(hostname: string, port: number) {
        return new TCPSocket(
            await Deno.connect({ hostname, port, transport: "tcp" }),
        );
    }
}

export class TCPListener implements BlancheNeige.Listener<TCPSocket> {
    public readonly listener: Deno.Listener;

    constructor(listener: Deno.Listener) {
        if (listener.addr.transport != "tcp") {
            throw new Error("This is not a TCP listener.");
        }

        this.listener = listener;
    }

    public async *[Symbol.asyncIterator]() {
        for await (const conn of this.listener) {
            yield new TCPSocket(conn);
        }
    }

    public static listen(hostname: string, port: number) {
        return new TCPListener(Deno.listen({ hostname, port, transport: "tcp" }));
    }
}

export async function* iterate(
    reader: Deno.Reader,
    size = 2048,
    method: "slice" | "subarray" = "slice",
) {
    let buffer = new Uint8Array(size);
    while (true) {
        let length = await reader.read(buffer);
        if (!length) break;
        yield buffer[method](0, length);
    }
}

export async function pipe(reader: Deno.Reader, writer: Deno.Writer) {
    for await (const buffer of iterate(reader)) {
        await writer.write(buffer);
    }
}

export class Proxy {
    constructor(sock1: BlancheNeige.Socket, sock2: BlancheNeige.Socket) {
        pipe(sock1, sock2);
        pipe(sock2, sock1);
    }
}

export class StringReader implements BlancheNeige.StringReader {
    public readonly reader: Deno.Reader;
    private readonly generator: AsyncGenerator<string>;

    constructor(reader: Deno.Reader, size = 2048) {
        this.reader = reader;
        this.generator = this.handler(size);
    }

    private async *handler(size: number) {
        for await (const buffer of iterate(this.reader, size)) {
            yield decoder.decode(buffer);
        }
    }

    public async read() {
        let result = await this.generator.next();
        if (!result.done) return result.value;
        else return null;
    }
}

export class StringWriter implements BlancheNeige.StringWriter {
    public readonly writer: Deno.Writer;

    constructor(writer: Deno.Writer) {
        this.writer = writer;
    }

    public async write(content: string) {
        await this.writer.write(encoder.encode(content));
    }
}

export class StringSocket implements BlancheNeige.StringSocket {
    public readonly read: () => Promise<string | null>;
    public readonly write: (content: string) => Promise<void>;

    constructor(
        reader: BlancheNeige.StringReader,
        writer: BlancheNeige.StringWriter,
    ) {
        this.read = reader.read.bind(reader);
        this.write = writer.write.bind(writer);
    }
}

export class TCPStringSocket extends StringSocket {
    constructor(conn: Deno.Conn) {
        if (conn.remoteAddr.transport != "tcp") {
            throw new Error("This is not a TCP connection.");
        }

        super(new StringReader(conn), new StringWriter(conn));
    }

    public static async connect(hostname: string, port: number) {
        return new TCPStringSocket(
            await Deno.connect({ hostname, port, transport: "tcp" }),
        );
    }
}

export class TCPStringListener
    implements BlancheNeige.StringListener<TCPStringSocket> {
    public readonly listener: Deno.Listener;

    constructor(listener: Deno.Listener) {
        if (listener.addr.transport != "tcp") {
            throw new Error("This is not a TCP listener.");
        }

        this.listener = listener;
    }

    public async *[Symbol.asyncIterator]() {
        for await (const conn of this.listener) {
            yield new TCPStringSocket(conn);
        }
    }

    public static listen(hostname: string, port: number) {
        return new TCPStringListener(
            Deno.listen({ hostname, port, transport: "tcp" }),
        );
    }
}

export async function* stringIterate(reader: BlancheNeige.StringReader) {
    while (true) {
        let message = await reader.read();
        if (!message) break;
        yield message;
    }
}

export async function stringPipe(
    reader: BlancheNeige.StringReader,
    writer: BlancheNeige.StringWriter,
) {
    for await (const message of stringIterate(reader)) {
        await writer.write(message);
    }
}

export class StringProxy {
    constructor(
        sock1: BlancheNeige.StringSocket,
        sock2: BlancheNeige.StringSocket,
    ) {
        stringPipe(sock1, sock2);
        stringPipe(sock2, sock1);
    }
}
