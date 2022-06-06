// Welcome message
console.log(Deno.readTextFileSync("./utils/ascii.art"));

// Importing modules
import { init } from "./src/init.ts";

// Initializing modules


// 1. init this node
let node = await init();
console.log(`Node name: ${node.name}`);

// 2. try to connect to other nodes

// 3. interact with other nodes
