import { RSAService } from "https://raw.githubusercontent.com/deno-microfunctions/rsa/main/src/rsa.ts"
import { AES } from "https://deno.land/x/god_crypto/aes.ts";

const rsaService = new RSAService()
const newRSAKeyPair = rsaService.generateKeyPair( 24 )
const message = "Hello World!" // Message to encrypt

// Generate signature
const signature = rsaService.createSignature(message, newRSAKeyPair.privateKey) // encrypted sha256 hash of signature
const encryptedMessage = rsaService.encrypt(message, newRSAKeyPair.publicKey) // returns encrypted message
const decryptedmessage = rsaService.decrypt(encryptedMessage, newRSAKeyPair.privateKey) // returns decrypted message


console.log(newRSAKeyPair)

let t = newRSAKeyPair.publicKey.E.toString()

console.log(`Generating key pair....`)
console.log(`Public Key: ${newRSAKeyPair.publicKey.E.toString()}`)

const aes = new AES("Hello World AES!", {
  mode: "cbc",
  iv: "BlancheNeigeNet1",
});
const cipher = await aes.encrypt(t);
console.log(`Domain name: ${cipher.hex()}.ba`)
// 41393374609eaee39fbe57c96b43a9da0d547c290501be50f983ecaac6c5fd1c

const plain = await aes.decrypt(cipher);


// Save the public key to a file
const n = newRSAKeyPair.publicKey.N.toString()
const publicKey = newRSAKeyPair.publicKey.E.toString()

Deno.writeTextFileSync("public.key", `${n}\n${publicKey}`)

const privateKey = newRSAKeyPair.privateKey.D.toString()
Deno.writeTextFileSync("private.key", `${n}\n${privateKey}`)

