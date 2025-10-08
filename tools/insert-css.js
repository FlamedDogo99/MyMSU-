const fileTools = require("file-tools.js");

const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const path = require("path");


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

fileTools.getFile("tools/userscript.template.js").then((template) =>
  fileTools.getFile("tools/style.css")
    .then((style) => runAutoprefixer(style))
    .then((css) => {
      const stylePath = path.resolve("src/style.css");
      const userscriptPath = path.resolve("userscript/myinfominus.user.js");
      return generateUserscript(template, css)
        .then((userscript) => fileTools.writeFile(userscriptPath, userscript))
        .then(() => fileTools.writeFile(stylePath, css));
    })
);