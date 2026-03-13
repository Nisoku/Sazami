const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "..", "src", "icons");

const ICON_SVGS = {};

const files = fs.readdirSync(iconsDir);
for (const file of files) {
  if (file.endsWith(".svg")) {
    const name = file.replace(".svg", "");
    const content = fs.readFileSync(path.join(iconsDir, file), "utf8");
    ICON_SVGS[name] = content;
  }
}

module.exports = { ICON_SVGS };
