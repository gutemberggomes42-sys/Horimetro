import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const srcHtml = path.resolve('index.html');
const destHtml = path.resolve(distDir, 'index.html');

if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

fs.copyFileSync(srcHtml, destHtml);

console.log('Standalone build prepared in dist/');
