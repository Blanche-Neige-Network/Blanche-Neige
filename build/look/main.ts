/**
 * This is use for looking for other client on the network.
 */
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { connect, TCPListener, decoder } from "../../libs/AnnA/main.ts";
import { networkInterfaces } from "../../libs/types/all.ts";

import { library } from '../../libs/types/all.ts';

import { master } from '../master.ts';
let t = master.getInstance();

export async function look() {
    console.log(`{/} Starting the look of the local network...`);
    if(existsSync("./node/startupIP")) {
        let ips = Deno.readTextFileSync("./node/startupIP").split("\n");
        for(let i = 0; i < ips.length; i++) {
            // check if the ip is a valid IPV4 address
            if(/(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/.test(ips[i])) {
                // check if this is a Blanche Neige server
                if(await testConnectToNode(ips[i])) {
                    ipIsValid(ips[i]);
                } else {
                    console.log(`{-} ${ips[i]} is not a valid server`);
                }
            }
        }
    }
    getLocalIp()
    console.log(`{/} Look of the local network finished`);
}


async function ipIsValid(ip:string) {
    let c = await connect({ port: 12598, hostname: ip })
    let newLibrary:library = {
        name:"none",
        version:"none",
        ip:ip,
        childs:[],
        connect: c,
        reader: null
    }
    // Add the reader to the new library
    newLibrary.reader = (async () => { while (true) { await newLibrary.connect.read(100); } })();

    // Add the new library to the list of library
    t.addNode(newLibrary);
}
/**
 * This function is use to get the local ip address of the computer.
 */
async function getLocalIp() {
    let Ifaces:networkInterfaces[] = Deno.networkInterfaces();
    for(let iface of Ifaces) {
        // Only ipv4 supported for the moment
        if(iface.family == "IPv4" && iface.address != "127.0.0.1" && iface.address.startsWith("192.168")){
            const [ip, mask] = iface.cidr.split("/");
            let availableIP = await calculAllAvailableIP(ip, convertCIDRToMask(parseInt(mask)), iface.address);
            for(let i = 0; i < availableIP.length; i++) {
                if(await testConnectToNode(availableIP[i])){
                    //ipIsValid(availableIP[i]);
                    console.log(`{+} Found a server on ${availableIP[i]}`);
                }
            }
        } 
    }
}


/**
 * Test the connection to the node via the ip address.
 */
export async function testConnectToNode(ip:string) {
    try {
        //console.log(`{+} Trying to connect to ${ip}`);
        let socket = await connect({ port: 12598, hostname: ip });
        (async () => { 
            while (true) { 
                try {
                    await socket.read(100); 
                } catch (error) {
                    return false;
                }
            } 
        })();
        let data = await socket.ask("/auth "+ip, 100);
        await socket.close();
        if(data){
            console.log(`{+} ${ip} is a valid node, responding to the look with: ${data}`);
            return true;
        } 
    } catch (error) {
        console.log(error)
    }
    return false
}

/**
 * Return all available ip address of the network.
 */
async function calculAllAvailableIP(ip:string, mask:string, myIp:string ) {
    let ipArray = ip.split(".");    
    let maskArray = mask.split(".");
    let availableIP:string[] = [];
    for(let i = 0; i < 4; i++) {
        let ipPart = ipArray[i];
        let maskPart = maskArray[i];
        if(maskPart == "255") {
            availableIP.push(ipPart);
        } else {
            let ipPartInt = parseInt(ipPart);
            let maskPartInt = parseInt(maskPart);
            let max = ipPartInt + maskPartInt;
            for(let j = ipPartInt; j < max; j++) {
                availableIP.push(j.toString());
            }
        }
    }
    let base = availableIP.join(".");
    let ips:string[] = []
    
    // Calculate all the available ip address
    for(let i = 1; i < 255; i++) {
        ips.push(base + "." + i);
    } 

    let newips:string[] = []
    if(availableIP.length == 2){
        for(let i = 0; i < ips.length; i++) {
            for(let j = 1; j < 255; j++) {
                newips.push(ips[i] + "." + j);
            }
        }
        ips = newips;
    }

    //remove my ip address from the list
    ips = ips.filter(ip => ip != myIp);

    return ips;
}

/**
 * Return the subnet mask of the network calculated from the CIDR prefix.
 */
function convertCIDRToMask(mask:number) {
    let maskBinary = ""
    for(let i = 0; i < 32; i++){
        if(i < mask){
            maskBinary += "1";
        } else {
            maskBinary += "0";
        }
    }
    let maskArray = maskBinary.match(/.{8}/g);
    let array:number[] = []
    if(maskArray){
        for(let i = 0; i < maskArray.length; i++){
            array[i] = parseInt(maskArray[i], 2);
        }
    }
    
    return array.join(".");
}