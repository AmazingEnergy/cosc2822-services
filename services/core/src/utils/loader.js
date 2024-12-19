const fs = require("fs");
const path = require("path");

/**
 *
 * @param options
 * @returns related path of all files from current directory (as root)
 * @type {(options: {location: string, currentDir: string, excludeFiles: string[], ext: string[], excludeExt: string[], recursive: boolean}) => Array<string>}
 */
module.exports.loadFiles = (options) => {
  if (!options.location || options.location === "")
    throw new Error("LoaderError", "Invalid load file options.");

  options.currentDir = options.currentDir ?? "";
  options.excludeFiles = options.excludeFiles ?? [];
  options.ext = options.ext ?? [".js"];
  options.excludeExt = options.excludeExt ?? [".text.js"];
  options.recursive = options.recursive ?? false;

  let result = [];

  let items = fs.readdirSync(options.location, {
    recursive: options.recursive,
  });

  items
    .filter((file) => {
      return (
        fs.lstatSync(path.join(options.location, file)).isFile() &&
        !file.startsWith(".") &&
        !options.excludeFiles.includes(file) &&
        options.ext.some((e) => file.endsWith(e)) &&
        options.excludeExt.some((e) => file.indexOf(e) === -1)
      );
    })
    .forEach((file) => result.push(path.join(options.currentDir, file)));

  items
    .filter((item) =>
      fs.lstatSync(path.join(options.location, item)).isDirectory()
    )
    .forEach((directory) => {
      result = result.concat(
        this.loadFiles({
          location: path.join(options.location, directory),
          currentDir: path.join(options.currentDir, directory),
          excludeFiles: options.excludeFiles,
          ext: options.ext,
          excludeExt: options.excludeExt,
          recursive: options.recursive,
        })
      );
    });

  if (options.currentDir === "")
    console.log(`Found ${result.length} files at ${options.location}.`);

  return result;
};
