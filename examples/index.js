const acefileExtractor = require("../src/extractors/acefile");

(async () => {
  // "https://acefile.co/f/98026591/mahoyome-s2-01-360p-samehadaku-care-mkv"
  // "https://acefile.co/f/98016641/kssnbw-1-1080p-samehadaku-care-mkv"
  // "https://acefile.co/f/98016970/kssnbw-1-720p-x265-samehadaku-care-mkv"

  await acefileExtractor(
    "https://acefile.co/f/98016642/kssnbw-1-fullhd-samehadaku-care-mp4"
  );
})();
