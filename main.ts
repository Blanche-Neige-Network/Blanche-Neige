/**
 * Welcome to Blanche Neige !
 */
console.log(Deno.readTextFileSync("./utils/ascii.art"));

// Create the initial data for the server
import { init } from "./build/init.ts";
await init();

// Import all the necessary files
import { master } from './build/master.ts';
let t = master.getInstance();

(async () => {
    await t.listen()
})();


import { look } from './build/look/main.ts';
look()


