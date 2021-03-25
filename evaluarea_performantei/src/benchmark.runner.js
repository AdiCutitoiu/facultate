const fs = require('fs');

function toKB(sizeInBytes) {
  return parseFloat((sizeInBytes / 1024).toFixed(2));
}

module.exports = async ({ worker = () => {}, input, output }) => {
  const inputFileSize = toKB(fs.statSync(input).size);
  const startTime = Date.now();

  const startMemory = process.memoryUsage().heapUsed;

  await worker({ input, output });

  const endMemory = process.memoryUsage().heapUsed;
  const diffMemory = endMemory - startMemory;

  const endTime = Date.now();
  const diffTime = endTime - startTime;

  const outputFileSize = toKB(fs.statSync(output).size);

  return {
    inputFileSize,
    outputFileSize,
    timeMs: diffTime,
    memoryKB: parseFloat((diffMemory / 1024).toFixed(2)),
  };
};
