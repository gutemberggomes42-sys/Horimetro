import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const htmlFiles = ['index.html', 'potencial.html', 'cota.html', 'entrega-hora.html', 'meta.html'];

if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

htmlFiles.forEach((fileName) => {
    const srcFile = path.resolve(fileName);
    if (!fs.existsSync(srcFile)) {
        throw new Error(`Arquivo obrigatório não encontrado: ${fileName}`);
    }
    const destFile = path.resolve(distDir, fileName);
    fs.copyFileSync(srcFile, destFile);
});

console.log(`Standalone build prepared in dist/ com ${htmlFiles.length} arquivos HTML.`);
