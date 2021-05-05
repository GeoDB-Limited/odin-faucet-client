import { StargateClient } from "@cosmjs/stargate";

import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import config from "./config.json"

function err(reason) {
    console.log(reason);
}

export async function txByHash(txHash) {
    const client = new StargateClient(await Tendermint34Client.connect(config.rpc));
    // Tx
    const txBody = await client.getTx(txHash).catch(err);
    console.log('Tx by hash:', txBody);
    return txBody;
}