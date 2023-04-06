const {
  watch,
  info,
  onGoing,
  latest,
  recomendation,
} = require("../src/scripts/samehadaku.crawler");

(async () => {
  // const response = await info("boku-no-hero-academia-the-movie-1-futari-no-hero/");
  // const response = await watch(
  //   "krakenfiles",
  //   "kono-subarashii-sekai-ni-bakuen-wo-episode-1"
  // );
  // const response = await onGoing();
  // const response = await latest(1);
  const response = await recomendation();

  console.log(response);
})();
