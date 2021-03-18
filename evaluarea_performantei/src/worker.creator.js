const fs = require("fs");
const lzma = require("lzma");
const lzString = require('lz-string');
const {gzipSync, unzipSync} = require('zlib');

const COMPRESSER_MAP = {
  lzma: {
    compress: async ({ input, output }) => {
      return new Promise((resolve, reject) => {
        lzma.compress(fs.readFileSync(input), 1, (result, error) => {
          if (error) {
            reject(error);
          }

          fs.writeFileSync(output, Buffer.from(result));
          resolve();
        });
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve, reject) => {
        lzma.decompress(fs.readFileSync(input), (result, error) => {
          if (error) {
            reject(error);
          }

          fs.writeFileSync(output, result);
          resolve();
        });
      });
    },
  },
  lzstring: {
    compress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const compressed = lzString.compressToUint8Array('' + fs.readFileSync(input))
        fs.writeFileSync(output, compressed);
        resolve();
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const decompressed = lzString.decompressFromUint8Array(fs.readFileSync(input))
        fs.writeFileSync(output, decompressed);
        resolve();
      });
    },
  },
  gzip: {
    compress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const compressed = gzipSync('' + fs.readFileSync(input))
        fs.writeFileSync(output, compressed);
        resolve();
      });
    },
    decompress: async ({ input, output }) => {
      return new Promise((resolve) => {
        const decompressed = unzipSync(fs.readFileSync(input))
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
