const updateRanking = async (celebs, ranking) => {
  const rankingUpdated = celebs
    .map(({ userId, userScore, picture, name, account, balance }) => {
      const oldRanking = ranking.find((rank) => rank.userId === userId);
      const positivePercent =
        (userScore.positiveTweets * 100) / userScore.totalTweets;
      const returnsPercent =
        ((balance.currentBalanceTotal - balance.initialBalance) * 100) /
        balance.initialBalance;

      return {
        userId,
        name,
        celebrity: picture,
        twitter: "@" + account,
        positiveTweets: userScore.positiveTweets,
        negativeTweets: userScore.negativeTweets,
        neutralTweets: userScore.neutralTweets,
        tweetsAmount: userScore.totalTweets,
        positivePercent,
        returnsPercent,
        currentBalanceTotal: balance.currentBalanceTotal,
        ...(oldRanking && {
          change24hrs: oldRanking.change24hrs,
          rank24hrs: oldRanking.rank24hrs,
          historicalBalance: oldRanking.historicalBalance
        }),
      };
    })
    .sort((first, second) => {
      return first.returnsPercent > second.returnsPercent
        ? -1
        : first.returnsPercent < second.returnsPercent
        ? 1
        : first.tweetsAmount > second.tweetsAmount
        ? -1
        : first.tweetsAmount < second.tweetsAmount
        ? 1
        : 0;
    });

  return rankingUpdated.map((rank, i) => ({
    ...rank,
    rank: i + 1,
  }));
};

module.exports = updateRanking;
