const express = require("express");
const bodyParser = require("body-parser");
const crossSpawn = require("cross-spawn");
const path = require("path");

const COMPRESSED_FOLDER = path.join(__dirname, "files", "compressed");
const DECOMPRESSED_FOLDER = path.join(__dirname, "files", "decompressed");

function execute({ inputPath, outputPath, algorithm, decompress = false }) {
  const args = [
    "runner.js",
    "-i",
    inputPath,
    "-o",
    outputPath,
    "-a",
    algorithm,
  ];

  if (decompress) {
    args.push("-d");
  }

  const result = crossSpawn.sync("node", args);
  if (result.error) {
    console.log(error);
  }

  const stdout = "" + result.stdout;
  return JSON.parse(stdout);
}

function buildOutputPath({ outputPath, fileName, algorithm }) {
  const extension = path.extname(fileName);
  const name = path.basename(fileName, extension);
  return path.join(outputPath, `${name}.${algorithm}${extension}`);
}

const runForFile = ({ algorithm, filePath }) => {
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

  const compressionRatio = (result1.outputFileSize / result1.inputFileSize).toFixed(2);

  return {
    sizeKb: result1.inputFileSize,
    [algorithm + "-compressionSizeKb"]: result1.outputFileSize,
    [algorithm + "-compressionTimeMs"]: result1.timeMs,
    [algorithm + "-compressionRatio"]: parseFloat(compressionRatio),
    [algorithm + "-compressionMemoryKb"]: result1.memoryKB,
    [algorithm + "-decompressionSizeKb"]: result2.outputFileSize,
    [algorithm + "-decompressionTimeMs"]: result2.timeMs,
    [algorithm + "-decompressionMemoryKb"]: result2.memoryKB,
  };
};

async function getFilePathAsync(fileId) {
  return fileId;
}

const ALGORITHMS = ["gzip", "lzma" /*"lzstring"*/];

function buildServer(port) {
  const server = express();

  server.use(bodyParser.json());

  server.post("/", async (req, res, next) => {
    try {
      const { fileId } = req.body;

      const filePath = await getFilePathAsync(fileId);

      const result = ALGORITHMS.reduce(
        (prevRes, algorithm) => ({
          ...prevRes,
          ...runForFile({ algorithm, filePath }),
        }),
        {}
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  server.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
}

buildServer(3000);
buildServer(3001);
buildServer(3002);
