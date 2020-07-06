const { neutralTweets, positiveTweets } = require("../../utils/constants");
const { trade } = require("./trade");
const callPromiseWithDeadline = require("../../utils/callPromiseWithDeadline");

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
