import { RSAService } from "https://raw.githubusercontent.com/deno-microfunctions/rsa/main/src/rsa.ts"
import { AES } from "https://deno.land/x/god_crypto/aes.ts";

const rsaService = new RSAService()
const newRSAKeyPair = rsaService.generateKeyPair( 24 )


console.log(`Generating key pair....`)
console.log(`Public Key: ${newRSAKeyPair.publicKey.E.toString()}`)

const aes = new AES("Hello World AES!", {
  mode: "cbc",
  iv: "BlancheNeigeNet1",
});
const cipher = await aes.encrypt(newRSAKeyPair.publicKey.E.toString());
const domain = cipher.hex() + ".ba"
console.log(`Domain name: ${domain}`)

Deno.mkdirSync("./domain/"+domain, { recursive: true })

// Save the public key to a file
const n = newRSAKeyPair.publicKey.N.toString()
const publicKey = newRSAKeyPair.publicKey.E.toString()

Deno.writeTextFileSync("./domain/"+domain+"/public.key", `${n}\n${publicKey}`)

const privateKey = newRSAKeyPair.privateKey.D.toString()
Deno.writeTextFileSync("./domain/"+domain+"/private.key", `${n}\n${privateKey}`)

Deno.writeTextFileSync("./domain/"+domain+'/domain.txt', `${cipher.hex()}.ba`)


