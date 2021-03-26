const fs = require("fs");
const lzString = require("lz-string");
const { gzipSync, unzipSync } = require("zlib");
const lzmaNative = require("lzma-native");

const COMPRESSER_MAP = {
  lzma: {
    compress: async ({ input, output }) => {
      return new Promise((resolve, reject) => {
        var compressor = lzmaNative.createCompressor();
        var inputStream = fs.createReadStream(input);
        var outputStream = fs.createWriteStream(output);

        inputStream.pipe(compressor).pipe(outputStream);
        outputStream.on("finish", resolve);
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve, reject) => {
        var decompressor = lzmaNative.createDecompressor();
        var inputStream = fs.createReadStream(input);
        var outputStream = fs.createWriteStream(output);

        inputStream.pipe(decompressor).pipe(outputStream);
        outputStream.on("finish", resolve);
      });
    },
  },
  lzstring: {
    compress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const compressed = lzString.compressToUint8Array(
          "" + fs.readFileSync(input)
        );
        fs.writeFileSync(output, compressed);
        resolve();
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const decompressed = lzString.decompressFromUint8Array(
          fs.readFileSync(input)
        );
        fs.writeFileSync(output, decompressed);
        resolve();
      });
    },
  },
  gzip: {
    compress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const compressed = gzipSync("" + fs.readFileSync(input));
        fs.writeFileSync(output, compressed);
        resolve();
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const decompressed = unzipSync(fs.readFileSync(input));
        fs.writeFileSync(output, decompressed);
        resolve();
      });
    },
  },
};

const ALGORITHMS = Object.keys(COMPRESSER_MAP);

module.exports = {
  getWorker: ({ type, decompress }) => {
    if (!ALGORITHMS.includes(type.toLowerCase())) {
      return null;
    }

    const alg = COMPRESSER_MAP[type];
    return decompress ? alg.decompress : alg.compress;
  },
  algorithms: ALGORITHMS,
};
