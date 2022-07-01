import fs from "fs";
import os from "os";
import { env } from "node:process";

// ---- Settings ---- //
const scanFolder = os.homedir();
const excludeFolders = ["node_modules"];
const excludeExtensions = [];
const excludeFiles = [".DS_Store"];
// ---- Settings ---- //

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

// Scan folders
const getAllFiles = function (dirPath) {
  var results = [];
  var list = fs.readdirSync(dirPath);
  list.forEach(function (file) {
    file = dirPath + "/" + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(getAllFiles(file));
    } else {
      /* Is a file */
      results.push(file + ` [${humanFileSize(stat.size)}]`);
    }
  });
  return results;
};

try {
  const result = getAllFiles(scanFolder);
  console.log(result.slice(0, 10));
} catch (e) {
  console.log(e);
}
