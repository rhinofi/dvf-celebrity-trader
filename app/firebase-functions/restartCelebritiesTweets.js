const firebaseInstance = require("./firebaseInstance");
const restartCelebritiesRankAndStartDate = require("../src/functions/celebrities/restartCelebritiesRankAndStartDate");

const restartCelebritiesTweets = async (req, res) => {
  const celebrities = await firebaseInstance
    .get("/celebrities.json")
    .then((res) => res.data.filter((value) => !!value));

  const config = await firebaseInstance
    .get("/config.json")
    .then(({ data }) => data);

  const {
    restartedCelebrities,
    ranking,
    startDate,
  } = await restartCelebritiesRankAndStartDate(celebrities);
  console.log("startDate", startDate);

  await firebaseInstance.put("/ranking.json", [...ranking]);
  await firebaseInstance.put("/celebrities.json", [...restartedCelebrities]);
  await firebaseInstance.put("/config.json", { ...config, startDate });

  return res.send("Celebrities Restarted and Ranking deleted");
};
module.exports = restartCelebritiesTweets;
