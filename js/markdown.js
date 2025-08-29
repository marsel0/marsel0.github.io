// Получаем параметр ?domain=
const params = new URLSearchParams(window.location.search);
const domain = params.get('domain') || 'default.com';

// Список Markdown-файлов (относительно корня)
async function loadDocs() {
  const container = document.getElementById('content');
  container.innerHTML = '';
  
  for (const file of files) {  // <- files приходит из files.js
    try {
      const res = await fetch(file);
      let md = await res.text();
      md = md.replace(/%host%/g, domain);
      const html = marked.parse(md);
      const div = document.createElement('div');
      div.innerHTML = html;
      container.appendChild(div);
    } catch (e) {
      console.error('Ошибка загрузки', file, e);
    }
  }
}

loadDocs();

