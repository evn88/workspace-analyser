import fs from "fs";
import os from "os";
import path from "path";
import ObjectsToCsv from "objects-to-csv";
import dotenv from "dotenv";
import humanFileSize from "./utils.js";
import _ from "lodash";

// ---- Settings ---- //
dotenv.config();
let scanFolder;
if (process.env.APPEND_HOME_PATH === "true") {
  scanFolder = os.homedir() + process.env.SCAN_FOLDER;
} else {
  scanFolder = process.env.SCAN_FOLDER;
}

const excludeFolders = ["node_modules", ".git"];
const includeExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".json",
  ".scss",
];
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
            ext,
          });
        }
      }
    }
  });
  return results;
};

try {
  // Detailed information about files;
  const details = getAllFiles(scanFolder);

  const csv = new ObjectsToCsv(details);
  await csv.toDisk("./reports/result.csv");

  // Total size & extensions
  const totalCountFiles = _.reduce(
    details,
    (resultObj, value, key) => {
      if (resultObj[value.ext]?.totalSize) {
        resultObj[value.ext].totalSize += value.byte;
        resultObj[value.ext].filesCount++;
      } else {
        resultObj[value.ext] = {
          totalSize: value.byte,
          filesCount: 1,
        };
      }
      return resultObj;
    },
    {}
  );
  const humanSizeInTotalCountFiles = _.map(totalCountFiles, (value, key) => {
    return {
      extension: key,
      totalSizeInByte: value.totalSize,
      totalSize: humanFileSize(value.totalSize),
      filesCount: value.filesCount,
    };
  });

  console.log(humanSizeInTotalCountFiles);
  const totalCsv = new ObjectsToCsv(humanSizeInTotalCountFiles);
  await totalCsv.toDisk("./reports/totalFiles.csv");
} catch (e) {
  console.log(e);
}
