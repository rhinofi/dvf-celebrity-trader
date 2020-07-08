const restartCelebritiesRankAndStartDate = require("../src/functions/celebrities/restartCelebritiesRankAndStartDate");
const { writeDatabase, readDatabase } = require("./firebaseDatabase");

const restartCelebritiesTweets = async (req, res) => {
  const celebrities = (await readDatabase("/celebrities")) || [];
  const config = await readDatabase("/config");

  const {
    restartedCelebrities,
    ranking,
    startDate,
  } = await restartCelebritiesRankAndStartDate(celebrities);
  console.log("startDate", startDate);

  await writeDatabase("/ranking", [...ranking]);
  await writeDatabase("/celebrities", [...restartedCelebrities]);
  await writeDatabase("/config", { ...config, startDate });

  return res.send("Celebrities Restarted and Ranking deleted");
};
module.exports = restartCelebritiesTweets;
