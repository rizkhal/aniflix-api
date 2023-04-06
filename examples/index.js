const {
  watch,
  info,
  onGoing,
  latest,
} = require("../src/scripts/samehadaku.crawler");

(async () => {
  // const response = await info("boku-no-hero-academia-the-movie-1-futari-no-hero/");
  // const response = await onGoing();
  const response = await latest(1);

  console.log(response);
})();
