const sass = require('sass');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

// Наблюдаем за всеми SCSS файлами в проекте
const watcher = chokidar.watch('src/**/*.scss', {
  persistent: true,
  ignoreInitial: false // Обрабатываем существующие файлы при старте
});

function compileSCSS(filePath) {
  try {
    const result = sass.compile(filePath);
    const cssPath = filePath.replace('.scss', '.css');
    
    fs.writeFileSync(cssPath, result.css);
    console.log(`✅ ${path.relative(process.cwd(), filePath)} → ${path.relative(process.cwd(), cssPath)}`);
    
    return cssPath;
  } catch (error) {
    console.error(`❌ Ошибка компиляции ${filePath}:`, error.message);
    return null;
  }
}

watcher
  .on('add', compileSCSS)
  .on('change', compileSCSS)
  .on('unlink', (filePath) => {
    const cssPath = filePath.replace('.scss', '.css');
    if (fs.existsSync(cssPath)) {
      fs.unlinkSync(cssPath);
      console.log(`🗑️ Удален: ${path.relative(process.cwd(), cssPath)}`);
    }
  });

console.log('👀 Отслеживание изменений SCSS...');