/* 
    A Blanche Neige node needs to have a few things:
    - node name
    - authentication listener
*/

import { generateRandomString } from '../utils/functions.ts';
import { AUTH_listener } from './auth/listener.ts';
import { AUTH_search } from './auth/search.ts';

export async function init() {
    // Initializing this node

    // Creating the node directory
    await Deno.mkdir("./node", { recursive: true });

    // Creating the node name
    let nodeName = generateNodeName();
    await Deno.writeTextFile("./node/name", nodeName);

    // Initializing the node auth listener
    const authListener = new AUTH_listener();
    authListener.listen();

    // Initializing the node auth search
    const authSearch = new AUTH_search();
    await authSearch.search();

    //Return node data
    return {
        name: nodeName,
        authListener: authListener
    };
}


function generateNodeName(){
    return generateRandomString(8);
}