const initialCelebrities = require("./initialCelebrities");
const getCelebrityTwitterInfo = require("../src/functions/celebrities/getCelebrityTwitterInfo");
const { writeDatabase } = require("./firebaseDatabase");

const createInitialFirebase = async (req, res) => {
  const { celebrities } = req.body;
  const celebritiesToMap = celebrities || initialCelebrities || [];

  const celebritiesUpdated = await Promise.all(
    celebritiesToMap.map(async (celebrity) => {
      const account = celebrity.twitterLink.split(".com/")[1];
      const [err, celeb] = await getCelebrityTwitterInfo(account);

      return {
        ...celebrity,
        account,
        ...(celeb && { userId: celeb.id_str }),
        ...(celeb && { name: celeb.name }),
        ...(celeb && { followers: celeb.followers_count }),
        ...(celeb && { picture: celeb.profile_image_url.replace('http://', 'https://') }),
        lastUpdatedTweet: null,
      };
    })
  );

  const ranking = celebritiesUpdated.map(
    ({ userId, picture, name, account }) => ({
      userId,
      celebrity: picture,
      name: name,
      twitter: "@" + account,
      positiveTweets: 0,
      negativeTweets: 0,
      neutralTweets: 0,
      tweetsAmount: 0,
      positivePercent: 0,
      change24hrs: 0,
    })
  );

  await writeDatabase("/celebrities", celebritiesUpdated);
  await writeDatabase("/ranking", ranking);

  return res.send("Celebrities Created");
};

module.exports = createInitialFirebase;
