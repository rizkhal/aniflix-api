const cheerio = require("cheerio");
const axios = require("axios");
const { unpackEvalScript } = require("../utils");

// FIXME: find mp4, mkv, m3u8 insteadof download
module.exports = async function (url, referer) {
  const sources = [];
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  $("script").each(function () {
    const script = $(this).html();
    if (script.includes("eval(function(p,a,c,k,e,d)")) {
      // const data = getAndUnpack(script);

      const id = "97976596";
      const key = "ea52f3ea6c5eda9dde4505efb5b961d89048ed37";

      axios
        .get(`https://acefile.co/local/${id}?key=${key}`)
        .then((response) => {
          console.log(response);
        });
    }
  });

  return sources;
};

const packedRegex = /eval\(function\(p,a,c,k,e,d.*\)\)/;
function getPacked(string) {
  const match = string.match(packedRegex);
  return match ? match[0] : null;
}

function getAndUnpack(data) {
  const packedText = getPacked(data);
  return unpackEvalScript(packedText);
}
