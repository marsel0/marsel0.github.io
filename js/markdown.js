// Получаем параметр ?domain=
const params = new URLSearchParams(window.location.search);
const domain = params.get('domain') || 'default.com';

// Список Markdown-файлов (относительно корня)
const files = [
  'docs/1_name.md'
];

async function loadDocs() {
  const container = document.getElementById('content');
  container.innerHTML = '';
  
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) {
        console.error('Ошибка загрузки', file, res.status);
        continue;
      }
      let md = await res.text();
      
      // Заменяем %host% на домен из параметра
      md = md.replace(/%host%/g, domain);
      
      // Рендерим Markdown в HTML
      const html = marked.parse(md);  // <- исправлено
      
      // Добавляем на страницу
      const div = document.createElement('div');
      div.innerHTML = html;
      container.appendChild(div);
    } catch (e) {
      console.error('Ошибка загрузки', file, e);
    }
  }
}

loadDocs();

