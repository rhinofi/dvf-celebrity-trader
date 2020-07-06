const db = require("../../database");
const updateRankingChange24Hours = require("../../functions/ranking/updateRankingChange24Hours");

exports.rankingChange24Hours = async () => {
  const ranking = db.get("ranking").value();
  const rankingUpdated = await updateRankingChange24Hours(ranking);
  await db.set("ranking", [...rankingUpdated]).write();

  console.log("24 Hours Changes Updated");
  return;
};
