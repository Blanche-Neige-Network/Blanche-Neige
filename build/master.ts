/**
 * Here is the master file for Blanche Neige.
 * It will create the nessessary listeners and start the server.
 * Also known for his data repartition.
 */

import { connect, TCPListener, decoder, Socket } from "../libs/AnnA/main.ts";
import { library } from "../libs/types/all.ts";


export class master {
    private static instance:master;

    public name:string = Deno.readTextFileSync("./node/name").trim();
    private server:TCPListener;
    private myLibrary:library[] = [];

    constructor(){
        this.server = TCPListener.from("0.0.0.0", 12598);
        setInterval(async () => {
            for(let i = 0; i < this.myLibrary.length; i++) {
                // Ask all the missing data
                if(this.myLibrary[i].name == "none") {
                    this.myLibrary[i].name = await this.myLibrary[i].connect.ask("/name");
                }
                if(this.myLibrary[i].version == "none") {
                    this.myLibrary[i].version = await this.myLibrary[i].connect.ask("/version");
                }
            }
        }, 1000);
    }

    public static getInstance() {
        if (!master.instance) {
            master.instance = new master();
        }
        return master.instance;
    }

    public echo(message:string) {
        console.log(message);
    }

    /**
     * This is the main router of the server.
     */
    async listen() {
        console.log("Starting the server...");
        for await (let client of this.server) {
            console.log(`{+} New node is connected to the server.`);
            while (true) {
                let msg = await client.read(100)
                if (!msg) break;
    
                let [id, content] = msg;

                // ONLY string for the moment
                this.repartitor(client, id, decoder.decode(content));
            }
        }
    }

    async repartitor(client:Socket, id:string, message:string) {
        message = this.cleaner(message);
        console.log(`{+} New message ${id} : "${message}" received ${message.length}`);

        if(message == "/ping") {
            await client.writeString("/pong", 10, id);
        } else if(message.startsWith("/auth")){ 
            await client.writeString(`/auth ok`, 10, id);
        } else if(message == "/name"){ 
            await client.writeString(`${this.name}`, this.name.length, id);
        } else if(message == "/version"){ 
            await client.writeString(`${Deno.readTextFileSync('./utils/v')}`, 10, id);
        }
    }

    /**
     * This part is for manage the all the other node stored in the library.
     */
    async addNode(node:library) {
        this.myLibrary.push(node);
    }

    async removeNode(node:library) {
        this.myLibrary.splice(this.myLibrary.indexOf(node), 1);
    }

    /**
     * Utils
     */
    cleaner(message){
        message = message.replace(/\x00/g, "");
        return message;
    }

}