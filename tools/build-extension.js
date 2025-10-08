const fileTools = require("./file-tools.js");

const target = process.argv[2];

fileTools.copyFiles("src/", "build/temp/")
  .catch(reason => {
    throw new Error("Unable to copy files from src to build/tmp. " + reason)
  })
  .then(() => {
    fileTools.getFile("src/manifest.json")
      .then(text => JSON.parse(text))
      .then(json => {
        switch(target) {
          case "chrome":
          case "edge":
            delete json.background.scripts;
            break;
          case "firefox":
            delete json.background.service_worker;
            break;
          default:
            throw new TypeError("Unknown browser target: " + target);
        }
        return JSON.stringify(json,null, 2);
      })
      .then(manifest => fileTools.writeFile("build/temp/manifest.json", manifest))
      .catch(reason => {
        throw new Error("Unable to make successful build. " + reason);
      })
  })