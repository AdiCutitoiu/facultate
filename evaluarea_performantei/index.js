const fs = require("fs");
const crossSpawn = require("cross-spawn");
const path = require("path");
const rimraf = require("rimraf");

const INITIAL_FOLDER = path.join(__dirname, "files", "initial");
const COMPRESSED_FOLDER = path.join(__dirname, "files", "compressed");
const DECOMPRESSED_FOLDER = path.join(__dirname, "files", "decompressed");

function init() {
  [COMPRESSED_FOLDER, DECOMPRESSED_FOLDER].forEach((folder) => {
    rimraf.sync(folder);
    fs.mkdirSync(folder);
  });
}

const files = fs
  .readdirSync(INITIAL_FOLDER)
  .map((name) => path.join(__dirname, name));

function buildArguments({
  inputPath,
  outputPath,
  algorithm,
  decompress = false,
}) {
  const arguments = [
    "runner.js",
    "-i",
    inputPath,
    "-o",
    outputPath,
    "-a",
    algorithm,
  ];

  if (decompress) {
    arguments.push("-d");
  }
}

function buildOutputPath({ inputPath, algorithm }) {
  const extension = path.extname(inputPath);
  const name = path.basename(inputPath, extension);
  return path.join("", `${name}.${algorithm}${extension}`);
}

const ALGORITHMS = ["lzma", "lzstring", "gzip"];

files.forEach((filePath) => {
  ALGORITHMS.forEach((algorithm) => {});
});

console.log(files);
