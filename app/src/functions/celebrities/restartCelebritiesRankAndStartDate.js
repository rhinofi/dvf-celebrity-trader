const moment = require("moment");

const restartCelebrities = async (celebrities) => {
  const startDate = moment().unix();
  const restartedCelebrities = celebrities.map(
    ({ twitterLink, address, userId, name, followers, picture, account }) => ({
      twitterLink,
      address,
      userId,
      name,
      followers,
      picture,
      account,
    })
  );

  return {
    restartedCelebrities,
    ranking: [],
    startDate,
  };
};

module.exports = restartCelebrities;
