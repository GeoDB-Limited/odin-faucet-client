import config from "./config.json"
import axios from "axios"
import {PendingTimeException} from "@/common/errors";

function err(reason) {
    console.log(reason.response.data)
    throw new PendingTimeException(reason.response.data, reason);
}

export async function sendTokens(addr, denom) {
    console.log(addr);
    return await axios.post(config.faucet, {
        address: addr,
        denom: denom
    }).catch(err);
}