const getUserTimeline = require("./getUserTimeline");
const formatTweetDate = require("./formatTweetDate");

const getTweetsFromNewUser = async ({
  userId,
  tweetsGetAmount,
  oldestTweet,
  startDate,
  allTweets = [],
}) => {
  const [err, response] = await getUserTimeline({
    userId,
    count: tweetsGetAmount,
    oldestTweet,
  });

  if (err) {
    console.error("Error while getting new user tweets", err);
    return [];
  }

  if (allTweets.length > 0) {
    response.splice(0, 1);
  }

  if (response.length === 0) {
    return [...allTweets];
  }

  const lastValueCreatedDate = formatTweetDate(
    response[response.length - 1].created_at
  );

  if (lastValueCreatedDate < startDate) {
    const responseTweetsFiltered = response.filter(
      ({ created_at }) => formatTweetDate(created_at) >= startDate
    );

    return [...allTweets, ...responseTweetsFiltered];
  } else {
    return getTweetsFromNewUser({
      userId,
      tweetsGetAmount,
      startDate,
      oldestTweet: response[response.length - 1].id,
      allTweets: [...allTweets, ...response],
    });
  }
};

module.exports = getTweetsFromNewUser;
