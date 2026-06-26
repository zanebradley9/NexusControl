import fs from "fs";
import path from "path";

const BASE_DIR = path.resolve("history");

// ensure base folders exist
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function ensureFolders() {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR);
  }

  for (const letter of LETTERS) {
    const dir = path.join(BASE_DIR, letter);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  const deletedDir = path.join(BASE_DIR, "_DELETED_ACCOUNTS");
  if (!fs.existsSync(deletedDir)) {
    fs.mkdirSync(deletedDir);
  }
}

function getLetterFolder(name) {
  const letter = (name?.[0] || "unknown").toUpperCase();
  return LETTERS.includes(letter) ? letter : "A";
}