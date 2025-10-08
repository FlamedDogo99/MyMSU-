const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const fs = require("fs");
const path = require("path");

/**
 * Get a file
 * @returns {Promise<string>} - the file's contents
 */
const getFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: "utf-8" }, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};
/**
 * Run Autoprefixer on css
 * @param {string} css - the css text to be auto-prefixed
 * @returns {Promise<string>}
 */
const runAutoprefixer = (css) => {
  return new Promise((resolve, reject) => {
    postcss([autoprefixer])
      .process(css)
      .then((result) => {
        result.warnings().forEach((warn) => {
          console.warn(warn.toString());
        });
        resolve(result.css);
      });
  });
};

/**
 *
 * @param {string} template
 * @param {string} css
 * @returns {Promise<string>}
 */
const generateUserscript = (template, css) => {
  return new Promise((resolve, reject) => {
    const replaceString = "//MyMSU-STYLE";
    const replaceStringIndex = template.indexOf(replaceString);
    if (replaceStringIndex === -1) {
      reject("Unable to find " + replaceString + "in template");
    } else {
      const userscript =
        template.slice(0, replaceStringIndex) +
        css +
        template.slice(replaceStringIndex + replaceString.length);
      resolve(userscript);
    }
  });
};
/**
 *
 * @param {string} text
 * @param {string} path
 * @returns {Promise<null>}
 */
const writeFile = (path, text) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, text, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

getFile("tools/userscript.template.js").then((template) =>
  getFile("tools/style.css")
    .then((style) => runAutoprefixer(style))
    .then((css) => {
      const stylePath = path.resolve("src/style.css");
      const userscriptPath = path.resolve("userscript/myinfominus.user.js");
      return generateUserscript(template, css)
        .then((userscript) => writeFile(userscriptPath, userscript))
        .then(() => writeFile(stylePath, css));
    })
);
