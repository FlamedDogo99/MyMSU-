const fs = require("fs");
/**
 * Get file at path
 * @param {string} path
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
exports.getFile = getFile;

/**
 * Write text to file at path
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
exports.writeFile = writeFile;

/**
 * Recursively copy files at source to destination
 * @param {string} source
 * @param {string} destination
 * @returns {Promise<null>}
 */
const copyFiles = (source, destination) => {
  return new Promise((resolve, reject) => {
    fs.cp(source, destination, {recursive: true}, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
exports.copyFiles = copyFiles;