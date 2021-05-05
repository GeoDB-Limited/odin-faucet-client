import {Tendermint34Client} from "@cosmjs/tendermint-rpc";
import {
    QueryClient,
    setupBankExtension,
} from "@cosmjs/stargate";
import config from "./config.json";
import { AccountNotFoundException } from "./errors";


function err(reason) {
    console.log(reason)
    if (reason.message.includes('invalid address')) {
        throw new AccountNotFoundException("account not found");
      } else {
        console.log("something bad happened");
      }
}

export async function balances(address) {
    const queryClient = QueryClient.withExtensions(
        await Tendermint34Client.connect(config.rpc),
        setupBankExtension,
    );

    const balances = await queryClient.bank.unverified.allBalances(address).catch(err);
    // check our balance
    console.log("Account:", address);
    console.log("Balance:", balances);
    return balances;
}