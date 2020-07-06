const moment = require("moment");
const Sentiment = require("sentiment");

const firebaseInstance = require("./firebaseInstance");
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
  const celebrities = await firebaseInstance
    .get("/celebrities.json")
    .then((res) => res.data.filter((value) => !!value));

  const config = await firebaseInstance
    .get("/config.json")
    .then(({ data }) => data);

  if (!config.startDate) {
    const now = moment().unix();
    config.startDate = now;
    await firebaseInstance.put("/config.json", { ...config });
  }

  const { tradeURL, startDate } = config;

  const celebritiesWithTweets = await celebritiesNewTweetsFinder({
    celebrities,
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
      }

      userTweetsFormatedAndTraded.push({
        created_at: formatTweetDate(created_at),
        id,
        text,
        screen_name: user.screen_name,
        sentiment: tweetSentiment,
        tradeCompleted,
        tradeResponse,
        tradeError,
      });
    }

    celebritiesTraded.push({
      ...celebrity,
      balance,
      userScore,
      newTweets,
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

  const ranking = await firebaseInstance
    .get("/ranking.json")
    .then((res) => res.data || []);

  const rankingUpdated = await updateRanking(celebritiesTraded, ranking);

  await firebaseInstance.put("/celebrities.json", [...celebritiesTraded]);
  await firebaseInstance.put("/ranking.json", [...rankingUpdated]);

  console.log("Celebrities Tweets Updated");
  return;
};

module.exports = getCelebritiesTweets;
