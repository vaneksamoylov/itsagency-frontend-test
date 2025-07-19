const liveServer = require('live-server');
const path = require('path');
const fs = require('fs');

// Параметры сервера
const params = {
  port: 8080,
  host: 'localhost',
  root: path.join(__dirname, ''), // Используем абсолютный путь
  open: '/index.html',
  ignore: '**/*.scss',
  file: 'index.html',
  logLevel: 2, // Включаем подробное логирование
  noCssInject: true,
};

// Запуск сервера
liveServer.start(params);
console.log(`🚀 Сервер запущен: http://${params.host}:${params.port}`);
console.log(`📂 Корневая директория: ${path.resolve(params.root)}`);
console.log(`🌐 Открываемая страница: ${params.open}`);