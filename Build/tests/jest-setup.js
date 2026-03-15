const fs = require("fs");
const path = require("path");
const cssEscape = require("css.escape");

// ResizeObserver is not available in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// CSS.escape for JSDOM
if (!global.CSS) {
  global.CSS = {};
}
global.CSS.escape = cssEscape;

global.importMetaGlob = function(pattern, options = {}) {
  const svgsDir = path.join(__dirname, "src", "icons", "svgs");
  const files = fs.readdirSync(svgsDir);
  const result = {};
  
  for (const file of files) {
    if (file.endsWith(".svg")) {
      const name = file.replace(".svg", "");
      const filePath = path.join(svgsDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      result["./svgs/" + file] = content;
    }
  }
  
  return result;
};

global.import = { meta: {} };
