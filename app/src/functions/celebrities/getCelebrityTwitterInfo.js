const T = require("../../utils/twiiterApi");

const getCelebrityTwitterInfo = (celebrity) =>
  T.get("users/search", { q: celebrity })
    .catch((err) => [err, undefined])
    .then((res) => {
      if (res && res.data) {
        const celeb = res.data.find((value) => value.screen_name === celebrity);

        return [undefined, celeb];
      }

      return [undefined, undefined];
    });

module.exports = getCelebrityTwitterInfo;
