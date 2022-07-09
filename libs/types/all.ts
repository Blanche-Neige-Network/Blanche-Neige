import { Socket } from "../AnnA/main.ts";

export interface library {
    name:string,
    version:string,
    ip:string,
    childs:libraryInfos[],
    connect:Socket,
    reader:Promise<never> | null
}

export interface libraryInfos {
    name:string,
    version:string,
    ip:string
}



/**
 * Look
 */
export interface networkInterfaces {
    family: string,
    name: string,
    address: string,
    netmask: string,
    scopeid: number | null,
    cidr: string,
    mac: string
}

/**
 * AnnA
 */
export interface askQueue {
    id:string,
    done:boolean,
    data:string | null
}