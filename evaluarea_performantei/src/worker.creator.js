const fs = require("fs");
const {
  gzipSync,
  unzipSync,
  brotliCompressSync,
  brotliDecompressSync,
} = require("zlib");
const lzmaNative = require("lzma-native");

const COMPRESSER_MAP = {
  lzma: {
    compress: async ({ input, output }) => {
      return new Promise((resolve, reject) => {
        const compressor = lzmaNative.createCompressor();
        const inputStream = fs.createReadStream(input);
        const outputStream = fs.createWriteStream(output);

        inputStream.pipe(compressor).pipe(outputStream);
        outputStream.on("finish", resolve);
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve, reject) => {
        const decompressor = lzmaNative.createDecompressor();
        const inputStream = fs.createReadStream(input);
        const outputStream = fs.createWriteStream(output);

        inputStream.pipe(decompressor).pipe(outputStream);
        outputStream.on("finish", resolve);
      });
    },
  },
  brotli: {
    compress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const compressed = brotliCompressSync("" + fs.readFileSync(input));
        fs.writeFileSync(output, compressed);
        resolve();
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const decompressed = brotliDecompressSync(fs.readFileSync(input));
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
