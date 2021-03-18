const { program, Option } = require("commander");
const { algorithms } = require('./worker.creator')

module.exports = function parse() {
  program.version("0.0.1");

  program
    .requiredOption("-i, --input <path1>", "input file")
    .requiredOption("-o, --output <path>", "output file")
    .option("-d, --decompress", "decompresses the input file", false);

  program.addOption(
    new Option("-a, --algorithm <type>")
      .makeOptionMandatory()
      .choices(algorithms)
  );

  program.parse(process.argv);

  return program.opts();
};
