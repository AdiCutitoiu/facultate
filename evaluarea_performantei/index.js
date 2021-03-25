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

init();

const files = fs
  .readdirSync(INITIAL_FOLDER)
  .map((name) => path.join(INITIAL_FOLDER, name));

function execute({ inputPath, outputPath, algorithm, decompress = false }) {
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

  const result = crossSpawn.sync("node", arguments);
  return result.stdout;
}

function buildOutputPath({ outputPath, fileName, algorithm }) {
  const extension = path.extname(fileName);
  const name = path.basename(fileName, extension);
  return path.join(outputPath, `${name}.${algorithm}${extension}`);
}

const ALGORITHMS = ["lzma", "lzstring", "gzip"];

files.forEach((filePath) => {
  const results = [];

  ALGORITHMS.forEach((algorithm) => {
    const fileName = path.basename(filePath);
    const compressedFilePath = buildOutputPath({
      outputPath: COMPRESSED_FOLDER,
      fileName,
      algorithm,
    });
    const decompressedFilePath = buildOutputPath({
      outputPath: DECOMPRESSED_FOLDER,
      fileName,
      algorithm,
    });

    const result1 = execute({
      inputPath: filePath,
      outputPath: compressedFilePath,
      algorithm,
    });
    const result2 = execute({
      inputPath: compressedFilePath,
      outputPath: decompressedFilePath,
      algorithm,
      decompress: true,
    });

    results.push({
        compression: JSON.parse('' + result1),
        decompression: JSON.parse('' + result2)
    })
  });

  console.log(results);
});
