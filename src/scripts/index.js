const { watch, info } = require("./samehadaku.crawler");

(async () => {
  // const response = await info("boku-no-hero-academia-the-movie-1-futari-no-hero/");
  // console.log(response);
  const response = await watch(
    "kaguya-sama-wa-kokurasetai-first-kiss-wa-owaranai-episode-1/"
  );
  console.log(response);
})();
