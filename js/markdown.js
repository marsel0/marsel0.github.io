// Получаем параметр ?domain=
const params = new URLSearchParams(window.location.search);
const domain = params.get('domain') || 'default.com';

async function loadDocs() {
  const container = document.getElementById('content');
  const tocContainer = document.getElementById('toc');
  container.innerHTML = '';
  tocContainer.innerHTML = '';

  const toc = [];
  const slugger = new marked.Slugger();  // v4 работает

  // Используем массив files из files.js
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) { console.error('Ошибка загрузки', file, res.status); continue; }

      let md = await res.text();
      md = md.replace(/%host%/g, domain);

      // Настройка renderer
      const renderer = new marked.Renderer();
      renderer.heading = function(text, level) {
        const id = slugger.slug(text);
        toc.push({ level, text, id });
        return `<h${level} id="${id}">${text}</h${level}>`;
      };

      const html = marked.marked(md, { renderer });
      const div = document.createElement('div');
      div.innerHTML = html;
      container.appendChild(div);

    } catch(e) { console.error('Ошибка загрузки', file, e); }
  }

  // Создание бокового оглавления
  toc.forEach(item => {
    const a = document.createElement('a');
    a.href = `#${item.id}`;
    a.textContent = item.text;
    a.style.display = 'block';
    a.style.marginLeft = (item.level - 1) * 15 + "px";
    tocContainer.appendChild(a);
  });

  // Кнопки "Copy" для блоков кода
  document.querySelectorAll('pre code').forEach(block => {
    const pre = block.parentNode;
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.className = 'copy-btn';
    btn.onclick = () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1000);
      });
    };
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}

loadDocs();

