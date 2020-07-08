const moment = require("moment");

const restartCelebrities = async (celebrities) => {
  const startDate = moment().unix();
  const restartedCelebrities = celebrities
    .filter((value) => !!value)
    .map(
      ({
        twitterLink,
        address,
        userId,
        name,
        followers,
        picture,
        account,
      }) => ({
        ...(twitterLink && { twitterLink }),
        ...(address && { address }),
        ...(userId && { userId }),
        ...(name && { name }),
        ...(followers && { followers }),
        ...(picture && { picture }),
        ...(account && { account }),
      })
    );

  return {
    restartedCelebrities,
    ranking: [],
    startDate,
  };
};

module.exports = restartCelebrities;
