const { watch } = require("./samehadaku.crawler");

(async () => {
  const result = await watch(
    "kaguya-sama-wa-kokurasetai-first-kiss-wa-owaranai-episode-1/"
  );

  console.log(result);
})();
