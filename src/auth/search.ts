/* 
    This class is used to search for other nodes.
    It will send a message to the other node and wait for a response.
    If the response is a success, the node will be added to the list of nodes.
*/

import { TCPStringSocket } from "../../utils/AnnA/mod.ts";

export class AUTH_search {
    async search() : Promise<string[]> {
        let ipList = ["1.3.5.7","127.0.0.1"];
        let nodeIpList:string[] = [];

        for(let ip of ipList){
            // Waiting for AnnA update for this part
            let tmpClient = await TCPStringSocket.connect(ip, 12598);
            console.log(tmpClient)
            await tmpClient.write("test");
        }

        return nodeIpList;
    }
}