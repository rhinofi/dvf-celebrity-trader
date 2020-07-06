const T = require("../../utils/twiiterApi");

const getUserTimeline = ({ userId, count, oldestTweet, moreRecentTweet }) =>
  T.get("statuses/user_timeline", {
    user_id: userId,
    count: count,
    since_id: moreRecentTweet,
    max_id: oldestTweet,
    trim_user: false,
    include_rts: false,
  })
    .catch((err) => [err, undefined])
    .then((res) => {
      return [undefined, res.data];
    });

module.exports = getUserTimeline;
