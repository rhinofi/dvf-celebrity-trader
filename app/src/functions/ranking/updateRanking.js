const updateRanking = async (celebs, ranking) => {
  const rankingUpdated = celebs.map(
    ({ userId, userScore, picture, name, account, balance, tweets }) => {
      const oldRanking = ranking.find((rank) => rank.userId === userId);
      const positivePercent =
        userScore.totalTweets > 0
          ? (userScore.positiveTweets * 100) / userScore.totalTweets
          : 0;
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
        ...(tweets &&
          tweets.length && {
            ...(tweets[0].text && { lastTweet: tweets[0].text }),
            ...(tweets[0].tweetId && { tweetId: tweets[0].tweetId }),
          }),
        currentBalanceTotal: balance.currentBalanceTotal,
        ...(balance.lastAction && { lastAction: balance.lastAction }),
        ...(balance.balanceETH && { balanceETH: balance.balanceETH }),
        ...(balance.balanceUSDT && { balanceUSDT: balance.balanceUSDT }),
        ...(oldRanking && {
          ...(oldRanking.change24hrs && {
            change24hrs: oldRanking.change24hrs,
          }),
          ...(oldRanking.rank24hrs && { rank24hrs: oldRanking.rank24hrs }),
          ...(oldRanking.historicalBalance && {
            historicalBalance: oldRanking.historicalBalance,
          }),
        }),
      };
    }
  );

  return rankingUpdated
    .sort(
      (a, b) =>
        b.returnsPercent - a.returnsPercent || b.tweetsAmount - a.tweetsAmount
    )
    .map((rank, i) => ({
      ...rank,
      rank: i + 1,
    }));
};

module.exports = updateRanking;
