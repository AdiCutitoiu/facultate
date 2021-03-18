const fs = require("fs");
const parseCommandLine = require("./src/command.line.parser");
const benchmarkRunner = require("./src/benchmark.runner");
const { getWorker } = require("./src/worker.creator");

async function main() {
  const { decompress, input, output, algorithm } = parseCommandLine();

  if (!fs.existsSync(input)) {
    process.stderr.write(`error: file '${input}' does not exist`);
    return;
  }

  const worker = getWorker({ type: algorithm, decompress });
  if (!worker) {
    return;
  }

  const result = await benchmarkRunner({ worker, input, output });

  console.log(result);
}

main();
