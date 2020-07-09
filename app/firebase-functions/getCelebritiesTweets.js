const moment = require("moment");
const Sentiment = require("sentiment");
const { writeDatabase, readDatabase } = require("./firebaseDatabase");
const celebritiesNewTweetsFinder = require("../src/functions/celebritiesTweets/celebritiesNewTweetsFinder");
const updateRanking = require("../src/functions/ranking/updateRanking");
const {
  neutralTweets,
  positiveTweets,
  negativeTweets,
} = require("../src/utils/constants");
const tradeTweet = require("./tradeTweet");
const formatTweetDate = require("../src/functions/celebritiesTweets/formatTweetDate");
const sentiment = new Sentiment();

const getCelebritiesTweets = async () => {
  const celebrities = await readDatabase("/celebrities");

  const config = await readDatabase("/config");

  if (!config.startDate) {
    const now = moment().unix();
    config.startDate = now;
    await writeDatabase("/config", { ...config });
  }

  const { tradeURL, startDate } = config;

  const celebritiesWithTweets = await celebritiesNewTweetsFinder({
    celebrities: celebrities.filter((value) => !!value),
    startDate,
  });

  const celebritiesTraded = [];

  for (const celebrity of celebritiesWithTweets) {
    const {
      tweets = [],
      newTweets,
      address,
      balance = { currentBalanceTotal: 1, initialBalance: 1 },
      userScore = {
        positiveTweets: 0,
        negativeTweets: 0,
        neutralTweets: 0,
        totalTweets: 0,
      },
    } = celebrity;

    const userTweetsFormatedAndTraded = [];

    for (const tweet of newTweets) {
      const { created_at, id, text, user } = tweet;
      const tweetSentiment = sentiment.analyze(text);
      const sentimentType =
        tweetSentiment.score === 0
          ? neutralTweets
          : tweetSentiment.score > 0
          ? positiveTweets
          : negativeTweets;

      userScore[sentimentType] += 1;
      userScore.totalTweets += 1;

      const { tradeCompleted, tradeResponse, tradeError } = await tradeTweet({
        sentimentType,
        address,
        tradeURL,
      });

      if (!tradeError && tradeCompleted && tradeResponse) {
        balance.currentBalanceTotal = tradeResponse.currentBalance.total;
        balance.balanceETH = tradeResponse.currentBalance.eth;
        balance.balanceUSDT = tradeResponse.currentBalance.usdt;
      }

      userTweetsFormatedAndTraded.push({
        created_at: formatTweetDate(created_at),
        id,
        text,
        screen_name: user.screen_name,
        sentiment: tweetSentiment,
        tradeCompleted,
        ...(tradeResponse && { tradeResponse }),
        ...(tradeError && { tradeError }),
      });
    }

    celebritiesTraded.push({
      ...celebrity,
      balance,
      userScore,
      ...(userTweetsFormatedAndTraded &&
        userTweetsFormatedAndTraded.length && {
          lastUpdatedTweet: userTweetsFormatedAndTraded[0].id,
        }),
      ...(userTweetsFormatedAndTraded &&
        userTweetsFormatedAndTraded.length && {
          tweets: [...userTweetsFormatedAndTraded, ...tweets],
        }),
    });
  }

  const ranking = (await readDatabase("/ranking")) || [];
  const rankingUpdated = await updateRanking(celebritiesTraded, ranking);

  await writeDatabase("/celebrities", [...celebritiesTraded]);
  await writeDatabase("/ranking", [...rankingUpdated]);

  console.log("Celebrities Tweets Updated");
  return;
};

module.exports = getCelebritiesTweets;
