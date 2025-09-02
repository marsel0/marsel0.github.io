// js/markdown.js

async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки ${path}: ${response.status}`);
    }

    const md = await response.text();

    // Кастомный рендерер для заголовков с якорями
    const renderer = {
      heading(text, level) {
        const slug = text.toLowerCase().replace(/[^\wа-яё]+/g, "-");
        return `<h${level} id="${slug}">${text}</h${level}>`;
      }
    };

    // Преобразуем markdown → html
    const html = marked.parse(md, { renderer });

    // Вставляем в контейнер
    const container = document.getElementById("content");
    if (container) {
      container.innerHTML = html;
    } else {
      console.warn('Контейнер с id="content" не найден.');
    }
  } catch (err) {
    console.error("Ошибка при загрузке markdown:", err);
  }
}

