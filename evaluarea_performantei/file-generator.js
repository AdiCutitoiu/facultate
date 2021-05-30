const fs = require("fs");
const path = require("path");

const PATH = path.join(__dirname, "files", "initial");
if (!fs.existsSync(PATH)) {
  fs.mkdirSync(PATH);
}

function makeRandomString(size) {
  const CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return new Array(size)
    .fill(" ")
    .map(() => {
      const idx = Math.floor(Math.random() * (CHARACTERS.length - 1));
      return CHARACTERS[idx];
    })
    .join("");
}

function generateFile(dimensionMB) {
  const fileName = `${dimensionMB}_MB.txt`;
  console.log(`Writing ${fileName}...`);

  const filePath = path.join(PATH, fileName);
  fs.writeFileSync(filePath, "");

  let current = dimensionMB;
  while (current) {
    const currentDimension = Math.min(10, current);
    fs.appendFileSync(
      filePath,
      makeRandomString(currentDimension * 1024 * 1024)
    );

    current = current - currentDimension;
  }
}

const DIMENSIONS = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 99];

DIMENSIONS.forEach(generateFile);
