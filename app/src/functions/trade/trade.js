const axios = require("axios");
const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const DVF = require("dvf-client-js");

const { API_URL, GATEWAY_URL, CHAIN_ID } = process.env;

const trade = async (address, amountPercentage, operation, tradeURL) => {
  if (tradeURL) {
    try {
      const res = await axios.post(tradeURL, {
        address,
        amountPercentage,
        operation,
      });
      console.log("Trade Success", (res && res.data) || res);

      return [undefined, res.data];
    } catch (err) {
      err =
        (err && err.response && err.response.data && err.response.data.error) ||
        (err && err.response) ||
        err;
      console.log("Error while Trading", err);
      return [err, undefined];
    }
  }

  const orderBook = await getOrderBook();

  if (!orderBook || !orderBook.buy || !orderBook.sell) {
    return ["Order book not found"];
  }

  const privateKey = process.env[address];

  if (!privateKey) {
    return ["Private key not found"];
  }

  try {
    const dvf = await getDVF(privateKey);
    const { tokenRegistry = {} } = await dvf.getConfig();
    const { ETH = {}, USDT = {} } = tokenRegistry;

    const { eth = 0, usdt = 0 } = await getExchangeBalances(dvf);

    const minEth = ETH.minOrderSize || 0.05;
    const minUsdt = USDT.minOrderSize || 10;

    let price = orderBook[operation === "sell" ? "buy" : "sell"];

    let amount;

    if (operation === "sell") {
      amount = amount || (eth / 100) * amountPercentage;
      amount = amount > minEth ? amount : eth > minEth ? minEth : 0;
      amount = -amount;
    } else {
      amount = amount || (usdt / 100) * amountPercentage;
      amount = amount > minUsdt ? amount : usdt > minUsdt ? minUsdt : 0;
      amount /= price;
      if (amount * price > usdt) {
        console.log("Proportion error", amount * price, usdt);
        amount = null;
      }
    }

    if (!amount) {
      console.log(address, "error");
      return ["NOT_ENOUGH_BALANCE"];
    }

    price = parseFloat(price.toFixed("2"));
    amount = parseFloat(amount.toFixed("2"));
    const response = await submitOrder(
      dvf,
      privateKey,
      "ETH:USDT",
      amount,
      price
    );

    await sleep(3);
    const orders = await dvf.getOrdersHist();

    const order = orders.find((item) => response && response._id === item._id);

    if (!order) {
      console.log(address, "error");
      return ["ORDER_NOT_SETTLED"];
    }

    let currentBalance = await getExchangeBalances(dvf);
    currentBalance.total = currentBalance.eth || 0;
    currentBalance.total += (currentBalance.usdt || 0) / order.averagePrice;
    currentBalance.total = parseFloat(currentBalance.total.toFixed("4"));

    res.json({
      amount: order.amount,
      createdAt: order.createdAt,
      price: order.averagePrice,
      symbol: order.symbol,
      tokenBuy: order.tokenBuy,
      tokenSell: order.tokenSell,
      canceled: order.canceled,
      active: order.active,
      currentBalance,
    });
  } catch (e) {
    console.log(e.message || e);
    return ["UNKNOWN_ERROR"];
  }
};

const getOrderBook = async () => {
  try {
    const res = await axios.get(`${API_URL}/bfx/v2/tickers?symbols=tETHUST`);
    let data = res ? res.data : [];

    if (!data.length || !data[0] || !data[0][1]) {
      return {
        buy: null,
        sell: null,
      };
    }

    const value = data[0][1];

    return {
      buy: value - 1,
      sell: value + 1,
    };
  } catch (e) {
    console.log("Error getting order book from api", e);
    return {
      buy: null,
      sell: null,
    };
  }
};

const getDVF = async (privateKey) => {
  const provider = new HDWalletProvider(privateKey, GATEWAY_URL);
  const web3 = new Web3(provider);
  provider.engine.stop();
  const { address } = web3.eth.accounts.privateKeyToAccount(privateKey);

  const dvfConfig = {
    api: API_URL,
    autoSelectAccount: false,
    autoLoadUserConf: true,
    chainId: CHAIN_ID || 3,
    address,
  };
  return DVF(web3, dvfConfig);
};

const getExchangeBalances = async (dvf) => {
  try {
    const balanceList = await dvf.getBalance();
    const exchange = balanceList.reduce((obj, item) => {
      const value = dvf.token.fromQuantizedAmount(item.token, item.available);
      obj[item.token.toLowerCase()] = parseFloat(value);
      return obj;
    }, {});

    return exchange;
  } catch (e) {
    console.log("error", e);
    return {};
  }
};

const submitOrder = async (
  dvf,
  privateKey,
  symbol,
  amount,
  price
) => {

  if (amount < 0) {
    price -= price * 0.1;
  } else {
    price += price * 0.1;
  }

  const submitOrderResponse = await dvf.submitOrder({
    symbol,
    amount,
    price,
    starkPrivateKey: privateKey,
  });  

  return submitOrderResponse;
};

const sleep = async (time) =>
  new Promise((resolve) => setTimeout(resolve, time * 1000 || 10000));

module.exports = { trade };
