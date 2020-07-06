const axios = require("axios");
const { neutralTweets, positiveTweets } = require("../src/utils/constants");
const callPromiseWithDeadline = require("../src/utils/callPromiseWithDeadline");

const trade = async (address, amountPercentage, operation, tradeURL) => {
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
};

const tradeTweet = async ({ sentimentType, address, tradeURL }) => {
  if (!tradeURL) {
    return {
      tradeCompleted: false,
      tradeError: {
        message: "Trade URL not configured",
      },
    };
  }

  if (sentimentType == neutralTweets) {
    return {
      tradeCompleted: false,
      tradeError: {
        message: "Tweet Sentiment Neutral (0).",
      },
    };
  }

  if (!address) {
    return {
      tradeCompleted: false,
      tradeError: { message: "No address for this tweet." },
    };
  }

  const amountPercentage = 20;
  const operation = sentimentType === positiveTweets ? "buy" : "sell";
  const [err, tradeResponse] = await callPromiseWithDeadline(() =>
    trade(address, amountPercentage, operation, tradeURL)
  );

  if (err) {
    return {
      tradeCompleted: false,
      tradeError: { message: "Error while trading", err },
    };
  }

  if (!tradeResponse) {
    return {
      tradeCompleted: false,
      tradeError: { message: "No trade response" },
    };
  }

  return {
    tradeCompleted: true,
    tradeResponse,
  };
};

module.exports = tradeTweet;
