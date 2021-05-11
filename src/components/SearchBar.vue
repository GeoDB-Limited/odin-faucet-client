<template>
  <div class="search-bar">
    <div class="container-fluid">
      <h2>Faucet</h2>

      <!-- <label for="accountAddress">Account address: </label> -->
      <div class="container">
        <div class="row d-flex justify-content-center">
          <select class="custom-select col-2 coin-select" v-model="denom">
            <option value="loki" selected>Loki</option>
            <option value="minigeo">Minigeo</option>
          </select>
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
          <div v-show="alertShow" :class="'alert alert-' + alertClass" role="alert">
            {{ alertText }}
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
import {Badges} from "@/common/badges";
import {balances} from "@/common/balances";
import {txByHash} from "@/common/querier";
import {AccountNotFoundException} from "@/common/errors";
import {sendTokens} from "@/common/faucet";

export default {
  name: "SearchBar",
  data() {
    return {
      account: "",
      query: "",
      denom: "loki",
      balances: null,
      badges: new Badges([]),
      showBalances: false,
      alertShow: false,
      alertText: "",
      alertClass: "",
      timer: null,
      txHash: "",
    };
  },
  methods: {
    async onSend() {
      clearInterval(this.timer);
      this.setAlert(false);
      this.txHash = "";

      const [alertShow, alertClass, alertText] = await this.fetchBalancesList();
      this.setAlert(alertShow, alertClass, alertText);

      try { // make sure send tokens doesn't fail
        this.setAlert(true, "secondary", "Status: sending tokens in progress...");
        const res = await sendTokens(this.account, this.denom);
        this.setAlert(true, "info", "Status: tokens sent, wait for the transaction approval");
        this.txHash = res.data.txHash;
        this.timer = setInterval(async () => {
          const [alertShow, alertClass, alertText] = await this.fetchBalancesList();
          this.setAlert(alertShow, alertClass, alertText);
        }, 5000);
      } catch (err) {
        console.log(err.message)
        if (err.data.error !== undefined) {
          if (err.data.time !== undefined) {
            this.setAlert(true, "warning", `Status: tokens limit per period reached, pending time left: ${new Date(err.data.time * 1000).toISOString().substr(11, 8)}`);
          } else {
            this.setAlert(true, "danger", err.data.error);
          }
        }
        console.log("failed to send tokens");
      }
    },
    async fetchBalancesList() {
      this.account = this.query;
      if (this.account === "") {
        console.log("account not found");
        return [false, "danger", "Error: account not found"];
      }

      try { // make sure get balances doesn't fail
        this.balances = await balances(this.account);
        this.showBalances = true;
        this.badges = new Badges(["success", "warning"]);

        if (this.txHash !== "") {
          const tx = await txByHash(this.txHash);

          console.log(tx.code);
          if (tx.code === 0) {
            clearInterval(this.timer);
            return [true, "success", "Status: success, transaction submitted"];
          }
          return [true, "danger", "Error: transaction failed"];
        }
        return [false, "", ""];
      } catch (err) {
        if (err instanceof AccountNotFoundException) {
          return [true, "danger", "Error: account not found"];
        } else {
          console.log("something bad happened");
          return [true, "danger", "Error: something bad happened"];
        }
      }
    },
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
    setAlert(alertShow, alertClass = "", alertText = "") {
      this.alertShow = alertShow;
      this.alertClass = alertClass;
      this.alertText = alertText;
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

.coin-select {
  margin-right: 15px;
  border: #000 2px solid;
  border-radius: 7px;
  font-weight: 700;
}
</style>
