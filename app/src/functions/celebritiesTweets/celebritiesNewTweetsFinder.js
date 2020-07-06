const getCelebrityTwitterInfo = require("../celebrities/getCelebrityTwitterInfo");
const getTweetsFromNewUser = require("./getTweetsFromNewUser");
const getTweetsFromUser = require("./getTweetsFromUser");

const celebritiesNewTweetsFinder = async ({ celebrities, startDate }) => {
  console.log("Starting to scan celebs");
  const newCelebrities = [];

  for (const celebrity of celebrities) {
    if (!celebrity.userId) {
      console.log("New User! Updating information");
      const account = celebrity.twitterLink.split(".com/")[1];
      const [err, celeb] = await getCelebrityTwitterInfo(account);

      const { id_str, name, followers_count, profile_image_url } = celeb;

      celebrity.userId = id_str;
      celebrity.name = name;
      celebrity.followers = followers_count;
      celebrity.picture = profile_image_url;
      celebrity.account = account;
    }
    console.log("Starting scan for", celebrity.name);
    const { userId, lastUpdatedTweet } = celebrity;

    const newTweets = !lastUpdatedTweet
      ? await getTweetsFromNewUser({
          userId,
          tweetsGetAmount: 100,
          startDate: startDate,
        })
      : await getTweetsFromUser({
          userId,
          tweetsGetAmount: 100,
          lastUpdatedTweet,
        });

    console.log("Amount of tweets scanned:", newTweets.length);

    newCelebrities.push({
      ...celebrity,
      newTweets,
    });
  }

  return newCelebrities;
};

module.exports = celebritiesNewTweetsFinder;
