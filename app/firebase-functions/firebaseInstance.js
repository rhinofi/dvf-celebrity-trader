const axios = require("axios");
// deversifi url: "https://dvf-celebrity-trader.firebaseio.com/"
// test url: "https://deversifi-trader.firebaseio.com/"

const instance = axios.create({
  baseURL: "https://dvf-celebrity-trader.firebaseio.com/",
});

module.exports = instance;
