export function generateRandomString(nb: number): string {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0; i < nb; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}