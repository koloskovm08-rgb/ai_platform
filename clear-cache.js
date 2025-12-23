const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    try {
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
      console.log(`✓ Удалена папка: ${folderPath}`);
    } catch (err) {
      console.error(`✗ Ошибка удаления ${folderPath}:`, err.message);
    }
  }
}

console.log('🧹 Очистка кеша...\n');

// Удаляем .next
deleteFolderRecursive(path.join(__dirname, '.next'));

// Удаляем node_modules/.cache
deleteFolderRecursive(path.join(__dirname, 'node_modules', '.cache'));

console.log('\n✓ Кеш очищен! Запустите: npm run build');

