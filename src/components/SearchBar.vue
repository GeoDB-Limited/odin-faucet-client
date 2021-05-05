<template>
  <div class="search-bar">
    <div class="container-fluid">
      <h2>Faucet</h2>

      <!-- <label for="accountAddress">Account address: </label> -->
      <div class="container">
        <div class="row d-flex justify-content-center">
          <input
            id="accountAddress"
            type="text"
            placeholder="odin1nnfeguq30x6nwxjhaypxymx3nulyspsuja4a2x"
            v-model="query"
          />
          <button
            type="button"
            class="btn btn-outline-info"
            v-on:click="onSend"
          >
            Send
          </button>
        </div>
        <div class="row d-flex justify-content-center">
          <div v-show="showErrorAlert" class="alert alert-danger" role="alert">
            {{ errAlertText }}
          </div>
          <div v-show="showInfoAlert" class="alert alert-info" role="alert">
            {{ infoAlertText }}
          </div>
          <div
            v-show="showSuccessAlert"
            class="alert alert-success"
            role="alert"
          >
            {{ successAlertText }}
          </div>
          <div
            v-show="showProcessAlert"
            class="alert alert-secondary"
            role="alert"
          >
            {{ processAlertText }}
          </div>
        </div>
      </div>
      <div v-show="showBalances">
        <h3>Balances:</h3>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col">Denom</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="balance in balances" v-bind:key="balance.denom">
              <th scope="row">
                <span class="badge badge-secondary"> {{ account }} </span>
              </th>
              <td>
                <span :class="'badge badge-' + badges.next()">{{
                  balance.denom
                }}</span>
              </td>
              <td class="amount">
                <span class="badge badge-light">{{
                  new Intl.NumberFormat("en-US").format(balance.amount)
                }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Badges } from "../common/badges.js";
import { balances } from "../common/balances.js";
import { txByHash } from "../common/querier.js";
import { AccountNotFoundException } from "../common/errors.js";
import { sendTokens } from "../common/faucet.js";

export default {
  name: "SearchBar",
  data() {
    return {
      account: "",
      query: "",
      balances: null,
      badges: new Badges([]),
      showBalances: false,
      showErrorAlert: false,
      showInfoAlert: false,
      showSuccessAlert: false,
      showProcessAlert: false,
      errAlertText: "",
      infoAlertText: "",
      successAlertText: "",
      processAlertText: "",
      timer: null,
      txHash: "",
    };
  },
  methods: {
    async onSend() {
      clearInterval(this.timer);
      this.resetHidden();
      this.txHash = "";

      try {
        await this.fetchBalancesList();
      } catch {
        // error logged already, we just should try to send tokens
        return;
      }

      try {
        this.showProcessAlert = true;
        this.processAlertText = "Status: sending tokens in progress...";
        const res = await sendTokens(this.query);
        this.showProcessAlert = false;
        this.showInfoAlert = true;
        this.infoAlertText =
          "Status: tokens sent, wait for the transaction approval";
        this.txHash = res.data.txHash;
        this.timer = setInterval(this.fetchBalancesList, 5000);
      } catch (err) {
        this.errAlertText = "Error: failed to send tokens";
        this.showErrorAlert = true;
        console.log("failed to send tokens");
      } finally {
        this.showProcessAlert = false;
      }
    },
    async fetchBalancesList() {
      this.resetHidden();

      this.account = this.query;
      if (this.account == "") {
        this.errAlertText = "Error: account not found";
        this.showErrorAlert = true;
        console.log("account not found");
        throw new AccountNotFoundException();
      }

      try {
        this.balances = await balances(this.account);
        this.showBalances = true;
        this.badges = new Badges(["success", "warning"]);

        if (this.txHash != "") {
          const tx = await txByHash(this.txHash);

          if (tx.code == 0) {
            clearInterval(this.timer);
            this.successAlertText = "Status: success, transaction submitted";
            this.showSuccessAlert = true;
          }
        }
      } catch (err) {
        if (err instanceof AccountNotFoundException) {
          this.errAlertText = "Error: account not found";
          this.showErrorAlert = true;
          console.log("account not found");
        } else {
          console.log("something bad happened");
        }
        throw err;
      }
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
    resetHidden() {
      this.showInfoAlert = false;
      this.showErrorAlert = false;
      this.showSuccessAlert = false;
      this.showBalances = false;
    },
  },
  beforeDestroy() {
    this.cancelAutoUpdate();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type="text"] {
  width: 50%;
  height: 4vh;
  border-radius: 7px;
  /* border-color: #17a2b8; */
  font-size: 10pt;
  padding: 10px;
  margin-right: 15px;
}

button {
  width: 8%;
  height: 4vh;
  font-size: 10pt;
  font-weight: 700;
}
/* label {
    padding: 10px;
} */
#accountAddress {
  margin-bottom: 3%;
}
.amount {
  font-style: italic;
}
.search-bar {
  min-height: 100%;
}

.alert {
  width: 60%;
}
</style>
