const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const CSV = require("csv-string");
const axios = require("axios").default;
const writeHtmlReport = require('./src/html.report.writer');

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

const SERVERS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const results = [];

async function runBenchmarks(server) {
  while (files.length) {
    const current = files.shift();
    if (!current) return;

    const {data: result} = await axios.post(server, { fileId: current });
    results.push(result);
  }
}

async function main() {
  await Promise.all(SERVERS.map(runBenchmarks));

  const csvRows = [
    CSV.stringify(Object.keys(results[0])),
    ...results.map((x) => CSV.stringify(x)),
  ];

  fs.writeFileSync("./report.csv", csvRows.join(""));

  writeHtmlReport(results);
}

main();