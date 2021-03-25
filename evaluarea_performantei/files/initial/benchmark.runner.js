module.exports = async ({ worker = () => {}, input, output }) => {
  const inputFileSize = 0;
  const startTime = Date.now();

  const startMemory = process.memoryUsage().heapUsed;

  await worker({ input, output });

  const endMemory = process.memoryUsage().heapUsed;
  const diffMemory = endMemory - startMemory;

  const endTime = Date.now();
  const diffTime = endTime - startTime;

  const outputFileSize = 0;

  return {
    inputFileSize,
    outputFileSize,
    timeMs: diffTime,
    memoryKB: diffMemory,
  };
};
