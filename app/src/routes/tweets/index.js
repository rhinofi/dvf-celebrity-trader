const db = require("../../database");
const moment = require("moment");
const Sentiment = require("sentiment");

const celebritiesNewTweetsFinder = require("../../functions/celebritiesTweets/celebritiesNewTweetsFinder");
const updateRanking = require("../../functions/ranking/updateRanking");
const restartCelebritiesRankAndStartDate = require("../../functions/celebrities/restartCelebritiesRankAndStartDate");
const {
  neutralTweets,
  positiveTweets,
  negativeTweets,
} = require("../../utils/constants");
const tradeTweet = require("../../functions/trade/tradeTweet");
const formatTweetDate = require("../../functions/celebritiesTweets/formatTweetDate");
const sentiment = new Sentiment();

exports.celebritiesNewTweetsFinder = async () => {
  const celebrities = db.get("celebrities").value();
  const config = db.get("config").value();

  if (!config.startDate) {
    const now = moment().unix();
    config.startDate = now;
    await db.set("config.startDate", now).write();
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

  const ranking = db.get("ranking").value();

  const rankingUpdated = await updateRanking(celebritiesTraded, ranking);

  await db.set("celebrities", [...celebritiesTraded]).write();
  await db.set("ranking", [...rankingUpdated]).write();

  console.log("Celebrities Tweets Updated");
  return;
};

exports.restartCelebritiesTweets = async (req, res) => {
  const celebrities = db.get("celebrities").value();
  const {
    restartedCelebrities,
    ranking,
    startDate,
  } = await restartCelebritiesRankAndStartDate(celebrities);

  await db.set("celebrities", [...restartedCelebrities]).write();
  await db.set("ranking", ranking).write();

  await db.set("config.startDate", startDate).write();
  return res.send("Celebrities Restarted and Ranking deleted");
};
