// Получаем параметр ?domain=
const params = new URLSearchParams(window.location.search);
const domain = params.get('domain') || 'default.com';

// Список Markdown-файлов (в порядке сортировки)
const files = [
  'docs/1_name.md',
  'docs/11_name.md',
  'docs/2_name.md',
  'docs/21_name.md',
  'docs/22_name.md',
  'docs/221_name.md'
];

// Функция загрузки и рендеринга MD
async function loadDocs() {
  const container = document.getElementById('content');
  container.innerHTML = '';
  
  for (const file of files) {
    try {
      const res = await fetch(file);
      let md = await res.text();
      
      // Заменяем %host% на домен из параметра
      md = md.replace(/%host%/g, domain);
      
      // Рендерим Markdown в HTML
      const html = marked(md);
      
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

