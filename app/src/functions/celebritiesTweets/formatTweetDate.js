const moment = require("moment");

const formatTweetDate = (date) => {
  const createdDate = new Date(date);
  return moment(createdDate).unix();
};

module.exports = formatTweetDate;
