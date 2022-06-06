/* 
    This class is used to listen to the authentication events.
    For exemple, when other node is trying to authenticate, this node will send a message to the other node.
*/

import { TCPStringListener } from "../../utils/AnnA/mod.ts";

export class AUTH_listener {
    private server = TCPStringListener.listen("0.0.0.0", 12598);

    async listen() : Promise<void> {
        for await (const client of this.server) {
            while (true) {
                let message = await client.read();
                if (!message) break;
                console.log(`Auth listener: ${message}`);
            }
        }
    }
}