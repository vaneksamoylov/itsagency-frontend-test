// import api from "./api";

export async function loadStyles(componentName) {
  try {
    const cssPath = `blocks/${componentName}/${componentName}.css`;
    const response = await fetch(cssPath);
    
    if (!response.ok) {
      throw new Error(`Стили не найдены: ${cssPath}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Ошибка загрузки стилей:', error);
    return ''; // Возвращаем пустую строку при ошибке
  }
}