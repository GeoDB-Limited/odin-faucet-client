import config from "./config.json"
import axios from "axios"

function err(reason) {
    console.log(reason)
    throw new Error();
}

export async function sendTokens(addr) {
    console.log(addr);
    return await axios.post(config.faucet, {
        address: addr,
    }).catch(err);
}