const fs = require("fs");
const crossSpawn = require("cross-spawn");
const path = require("path");
const rimraf = require("rimraf");
const CSV = require('csv-string');

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
  if(result.error) {
    console.log(error);
  }

  const stdout = '' + result.stdout;
  return JSON.parse(stdout);
}

function buildOutputPath({ outputPath, fileName, algorithm }) {
  const extension = path.extname(fileName);
  const name = path.basename(fileName, extension);
  return path.join(outputPath, `${name}.${algorithm}${extension}`);
}

const ALGORITHMS = ["lzma", /*"lzstring", "gzip"*/];

const results = [];

files.forEach((filePath) => {
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
      sizeKb: result1.inputFileSize,
      compressionSizeKb: result1.outputFileSize,
      compressionTimeMs: result1.timeMs,
      compressionMemoryKb: result1.memoryKB,
      decompressionTimeMs: result2.timeMs,
      decompressionMemoryKb: result2.memoryKB,
    });
  });
});

const csvRows = [
  CSV.stringify(Object.keys(results[0])),
  ...results.map(x => CSV.stringify(x))
]

fs.writeFileSync('./report.csv', csvRows.join(''));
