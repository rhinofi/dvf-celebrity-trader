const updateRankingChange24Hours = require("../src/functions/ranking/updateRankingChange24Hours");
const { writeDatabase, readDatabase } = require("./firebaseDatabase");

const rankingChange24Hours = async () => {
  const ranking = await readDatabase("/ranking");

  const rankingUpdated = await updateRankingChange24Hours(ranking);

  await writeDatabase("/ranking", [...rankingUpdated]);

  console.log("24 Hours Changes Updated");
  return;
};

module.exports = rankingChange24Hours;
