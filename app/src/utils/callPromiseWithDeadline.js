const callPromiseWithDeadline = async (promise, seconds = 60) => {
  return new Promise(function (resolve, reject) {
    promise()
      .then((data) => resolve(data))
      .catch((data) => {
        resolve(data);
      });

    setTimeout(function () {
      resolve(["Promise timed out after " + seconds + " seconds"]);
    }, seconds * 1000);
  });
};

module.exports = callPromiseWithDeadline;
