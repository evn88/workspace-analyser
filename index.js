import fs from "fs";
import os from "os";
import path from "path";
import ObjectsToCsv from "objects-to-csv";
import dotenv from "dotenv";
import humanFileSize from "./utils.js";

// ---- Settings ---- //
dotenv.config();
let scanFolder;
if (process.env.APPEND_HOME_PATH === "true") {
  scanFolder = os.homedir() + process.env.SCAN_FOLDER;
} else {
  scanFolder = process.env.SCAN_FOLDER;
}

const excludeFolders = ["node_modules", ".git"];
const includeExtensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".json"];
const excludeFiles = [".DS_Store"];
const hidePathString = process.env.HIDE_PATH_STRING;
// ---- Settings ---- //

// Scan folders
const getAllFiles = function (dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);
  list.forEach(function (file) {
    if (!excludeFolders.includes(file) && !excludeFiles.includes(file)) {
      file = dirPath + "/" + file;
      const stat = fs.statSync(file);

      if (stat && stat.isDirectory()) {
        /* Recurse into a subdirectory */
        results = results.concat(getAllFiles(file));
      } else {
        /* Is a file */
        const ext = path.extname(file);
        if (includeExtensions.includes(ext)) {
          results.push({
            path: file.replace(hidePathString, ""),
            byte: stat.size,
            humanSize: `${humanFileSize(stat.size)}`,
          });
        }
      }
    }
  });
  return results;
};

try {
  const result = getAllFiles(scanFolder);
  const csv = new ObjectsToCsv(result);
  await csv.toDisk("./reports/result.csv");

  // console.log(result.slice(0, 10));
} catch (e) {
  console.log(e);
}
