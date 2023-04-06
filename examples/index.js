const {
  watch,
  info,
  onGoing,
  latest,
  recomendation,
} = require("../src/scripts/samehadaku.crawler");

(async () => {
  const response = await info("dr-stone-season-3-dr-stone-new-world/");
  // const response = await watch(
  //   "krakenfiles",
  //   "kono-subarashii-sekai-ni-bakuen-wo-episode-1"
  // );
  // const response = await onGoing();
  // const response = await latest(1);
  // const response = await recomendation();

  console.log(response);
})();
