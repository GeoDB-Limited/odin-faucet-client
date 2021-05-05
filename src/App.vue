<template>
  <div id="app">
    <img alt="Odin logo" src="./assets/odin-logo.png" />
    <search-bar />
    <!-- <footer class="text-center text-white">
      <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2)">
        © 2021 Copyright:
        <a class="text-white" href="https://odin-protocol.com/"
          >OdinProtocol.com</a
        >
      </div>
    </footer> -->
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";

export default {
  name: "App",
  components: {
    SearchBar,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  min-height: 100%;
}
html, body{height:100%;} 
</style>
