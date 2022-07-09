import { RSAService } from "https://raw.githubusercontent.com/deno-microfunctions/rsa/main/src/rsa.ts"
import { AES } from "https://deno.land/x/god_crypto/aes.ts";

let f1 = Deno.readTextFileSync("public.key").split("\n");
let f2 = Deno.readTextFileSync("private.key").split("\n");


const rsaService = new RSAService()
const newRSAKeyPair = {
    publicKey: {
        N: BigInt(f1[0]),
        E: BigInt(f1[1])
    },
    privateKey: {
        N: BigInt(f2[0]),
        D: BigInt(f2[1])
    }
}

console.log(newRSAKeyPair)

const message = "testing"
const encryptedMessage = rsaService.encrypt(message, newRSAKeyPair.publicKey) // returns encrypted message
const decryptedmessage = rsaService.decrypt(encryptedMessage, newRSAKeyPair.privateKey) // returns decrypted message
console.log(encryptedMessage)
console.log(decryptedmessage)

