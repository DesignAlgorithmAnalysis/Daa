
import express from "express";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import { marked } from 'marked';
import { insertString } from './utility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const articlesDirectory = join(__dirname, "./public/articles");

const app = express();
const port = 3010;
const server = http.createServer(app);

// Serve static files from 'static' directory
app.use(express.static("public"));

// get list of all the articles
app.get("/articles", (req, res)=>{
  const articles = fs
    .readdirSync(articlesDirectory)
    .filter(fileName => {
      return fs.lstatSync( join(articlesDirectory, fileName)).isFile();
    });

    res.json(articles);
})


// Serve elements based on query parameters
app.get("/:name", (req, res) => {
  const { name } = req.params;

  if (!name) {
    return res.redirect("/");
    //return res.status(400).json({ error: "Invalid request format" });
  }

  const fileName = name + '.md';
  const filePath = join(articlesDirectory, fileName);
  

  if (!fs.existsSync(filePath)) {
    return res.status(404).redirect("/");
  }

  const text = read(filePath);
  const lines = toLines(text);

  const { preview } = req.query;
  
  if(preview) {
    // send only the preview
    const indexString = preview.replaceAll(String.fromCharCode(34),''); // removing  '"'
    
    const previewLines = filterLinesByIndexRange(lines, indexString);
    const previewHTML = marked.parse(previewLines.join('\n'));

    return res.send(previewHTML);
  }

  // else share the full article
  const textHTML = marked.parse(text);
  const title = lines.find(line => line.includes('# ')).replace('# ','');
  return res.send(buildArticlePage(textHTML, title));
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


// ---
/**
 * Reads the text from a markdown file and returns specific lines or the whole content.
 * @param {string} filePath - The path to the markdown file.
 * @param {(number|number[]|string)} lineIndex - The line index (0-based), an array of indices, or 'all' to get the entire content.
 * @returns {(string|null)} - The requested lines or the whole content, or null if the lineIndex is out of range.
 */
function getMDText(filePath, lineIndex = 'all') {
  // Check if the file exists and is readable
  if (!fs.existsSync(filePath)) {
    return null;
  }

  // Read the entire content of the file
  const textMD = fs.readFileSync(filePath, 'utf8');

  // Return the entire content if lineIndex is 'all' or undefined
  if (lineIndex === 'all' || lineIndex === undefined) {
    return textMD;
  }

  // Split the content into lines
  const linesMD = textMD.split(/\r?\n/);

  // Handle an array of indices
  if (Array.isArray(lineIndex)) {
    const filteredLines = lineIndex
      .filter(index => index >= 0 && index < linesMD.length) // Validate indices
      .map(index => linesMD[index]) // Get the lines at the given indices
      .join('\n'); // Join them with newline
    return filteredLines == '' ? null : filteredLines;
  }

  // Handle a single index
  const index = Number(lineIndex);
  console.log(lineIndex);
  if (Number.isInteger(index)) {
    return (index >= 0 && index < linesMD.length) ? linesMD[index] : null;
  }

  // Return null for any other unexpected value of lineIndex
  return null;
}

function buildArticlePage(articleHTML, name) {
  let article = fs.readFileSync(join(__dirname, './public/templates/article.html'), 'utf-8');
  article = insertString(article,'<title>', name);
  return insertString(article, '<article>', articleHTML);
}

// read file
function read(filePath) {return fs.readFileSync(filePath, 'utf-8');}; 
// convert to lines
function toLines(text) {return text.split('\n')};
// search in text
function searchText(text, searchString) {return text.match(searchString)};
// search in lines
function searchInLines(lines, searchString) {return lines.map(line => line.match(searchString)).filter(result => result !== null)};
// filter lines by search
function filterLinesBySearch(lines, searchString) {return lines.filter(line => line.match(searchString) !== null)};
// filter lines by index range
function filterLinesByIndexRange(lines, rangeString) { 
  const range = rangeString.split(':').map((item, index) => {
    if(item == 'start' || (item == '' && index == 0)) {
      return 0;
    }

    if(item == 'end' || (item == '' && index == 1)) {
      return lines.length-1;
    }

    if(Number.isInteger(Number(item))) {
      return Number(item);
    }

    return null;
  });
  return lines.filter( (line, index) => index >= range[0] && index <= range[1] );
};