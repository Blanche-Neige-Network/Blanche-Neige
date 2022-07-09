/**
 * This function allows you to create all the necessary data for a new server.
 */
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { generateRandomString } from '../utils/functions.ts';

export async function init() {
    /**
     * Name of the server.
     */
    // check path "./node/name"
    Deno.mkdirSync("./node/", { recursive: true });
    if(!existsSync("./node/name")) {
        Deno.writeTextFileSync("./node/name", generateRandomString(24));
    }

    /**
     * Nothing else for the moment
     */

}