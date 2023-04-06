const { watch, info, onGoing } = require("../src/scripts/samehadaku.crawler");

(async () => {
  // const response = await info("boku-no-hero-academia-the-movie-1-futari-no-hero/");
  // console.log(response);

  const response = await onGoing();
})();
