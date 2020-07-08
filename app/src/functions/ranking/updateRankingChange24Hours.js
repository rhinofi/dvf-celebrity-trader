const moment = require("moment");

const updateRankingChange24Hours = (ranking) => {
  const today = moment().format("YYYY-MM-DD");
  return ranking.map((rank) => {
    return {
      ...rank,
      historicalBalance: {
        ...rank.historicalBalance,
        [today]: rank.currentBalanceTotal,
      },
      ...(rank.rank && { rank24hrs: rank.rank }),
      ...(rank.returnsPercent && { change24hrs: rank.returnsPercent }),
    };
  });
};

module.exports = updateRankingChange24Hours;
