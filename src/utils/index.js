const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";

// unpacked `eval()` script
// https://matthewfl.com/unPacker.html
function unpackEvalScript(script) {
  const pattern = /eval\((.*)\)/;
  const match = pattern.exec(script);
  if (match) {
    const evalString = match[1];
    const unpacked = new Function("return " + evalString)();
    if (typeof unpacked === "string") {
      return unpacked;
    }
  }

  return script;
}

module.exports = {
  USER_AGENT,
  unpackEvalScript,
};
