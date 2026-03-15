const fs = require("fs");
const path = require("path");

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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
