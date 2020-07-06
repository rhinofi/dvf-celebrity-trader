const firebaseInstance = require("./firebaseInstance");
const updateRankingChange24Hours = require("../src/functions/ranking/updateRankingChange24Hours");

const rankingChange24Hours = async () => {
  const ranking = await firebaseInstance
    .get("/ranking.json")
    .then(({ data }) => data);

  const rankingUpdated = await updateRankingChange24Hours(ranking);

  await firebaseInstance.put("/ranking.json", [...rankingUpdated]);

  console.log("24 Hours Changes Updated");
  return;
};

module.exports = rankingChange24Hours;
