const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const archiver = require('archiver');

const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'public', 'css');

// Create dist directories
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Files to copy (without processing)
const copyFiles = [
  'index.html',
  'LICENSE',
  'README.md'
];

// Files to minify
const jsFiles = [
  'js/core.js',
  'js/dragUpload.js',
  'js/editor.js',
  'js/eventHandler.js',
  'js/imageManager.js',
  'js/ui.js',
  'js/viewer.js',
  'themes.js'
];

const cssFiles = [
  'public/css/main.css'
];

// Copy files function
function copyFile(source, target) {
  fs.copyFileSync(source, target);
  console.log(`Copied: ${source} -> ${target}`);
}

// Minify JS function
async function minifyJs(source, target) {
  const code = fs.readFileSync(source, 'utf8');
  const result = await minify(code);
  fs.writeFileSync(target, result.code);
  console.log(`Minified JS: ${source} -> ${target}`);
}

// Minify CSS function
function minifyCss(source, target) {
  const code = fs.readFileSync(source, 'utf8');
  const result = new CleanCSS().minify(code);
  fs.writeFileSync(target, result.styles);
  console.log(`Minified CSS: ${source} -> ${target}`);
}

// Process files
copyFiles.forEach(file => {
  copyFile(file, path.join(distDir, file));
});

jsFiles.forEach(async file => {
  const sourcePath = file;
  const targetPath = path.join(distDir, file);
  const targetDir = path.dirname(targetPath);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  await minifyJs(sourcePath, targetPath);
});

cssFiles.forEach(file => {
  const sourcePath = file;
  const targetPath = path.join(distDir, file);
  const targetDir = path.dirname(targetPath);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  minifyCss(sourcePath, targetPath);
});

// Create zip file
const output = fs.createWriteStream(path.join(__dirname, 'liteImagePreviewer.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`ZIP created: ${archive.pointer()} total bytes`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, 'liteImagePreviewer');
archive.finalize();

console.log('Build complete! Dist folder ready for deployment.');
