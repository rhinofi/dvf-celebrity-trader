const getUserTimeline = require("./getUserTimeline");

const getTweetsFromUser = async ({
  userId,
  tweetsGetAmount,
  lastUpdatedTweet,
}) => {
  const [err, response] = await getUserTimeline({
    userId,
    tweetsGetAmount,
    moreRecentTweet: lastUpdatedTweet,
  });

  if (err) {
    console.error("Error while getting new user tweets", err);
    return [];
  }

  return response.filter(({ id }) => id !== lastUpdatedTweet);
};

module.exports = getTweetsFromUser;
