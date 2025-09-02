(() => {
  // ===== ПАРАМЕТРЫ И ВСПОМОГАТЕЛЬНОЕ =====
  const qs = new URLSearchParams(window.location.search);
  const domain = (qs.get("domain") || "").trim();
  const domainBadge = document.getElementById("domain-badge");
  domainBadge.textContent = `domain: ${domain || "—"}`;

  const statusEl = document.getElementById("status");
  const docEl = document.getElementById("doc");
  const tocEl = document.getElementById("toc-list");

  // Если domain не передан — можно использовать текущий хост как дефолт
  const resolvedDomain = domain || window.location.host;

  // Для гарантии уникальности якорей (если одинаковые заголовки в разных файлах)
  const slugger = new marked.marked.Slugger();
  const makeId = (fileIndex, text) => {
    const base = slugger.slug(text);
    return `h1-${fileIndex}-${base}`;
  };

  // ===== НАСТРОЙКА MARKED И HIGHLIGHT =====
  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
    mangle: false, // не портить id с кириллицей
    highlight: function (code, lang) {
      try {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
      } catch (_) {}
      // автоопределение
      try {
        return hljs.highlightAuto(code).value;
      } catch (_) {}
      return code;
    },
  });

  const renderer = new marked.Renderer();
  const toc = []; // [{text, id}]

  // Переписываем рендер заголовков: собираем оглавление только по # (уровень 1)
  renderer.heading = function (text, level, raw, sluggerLocal) {
    if (level === 1) {
      // id задаём позже при конкатенации (нам нужен индекс файла), временно вернем без id
      // но нам нужно сохранить текст — сохраним маркер, который потом заменим
      const placeholder = `__H1_PLACEHOLDER__::${raw}`;
      return `<h1>${text}</h1>\n<!--${placeholder}-->`;
    } else {
      // для остальных уровней пусть Marked сам генерит id
      const slug = sluggerLocal.slug(raw);
      return `<h${level} id="${slug}">${text}</h${level}>\n`;
    }
  };

  // Код-блоки — обычный рендер (подсветка сделает highlight.js)
  // Отдельной кастомизации не требуется — кнопки "копировать" добавим уже по DOM.

  // Сборка всех md -> один HTML
  async function loadAll() {
    if (!Array.isArray(window.files) || window.files.length === 0) {
      throw new Error("Список файлов пуст. Убедитесь, что js/files.js корректно сгенерирован.");
    }

    const htmlParts = [];

    for (let i = 0; i < files.length; i++) {
      const path = files[i];
      const url = encodeURI(path); // корректно обработает пробелы и скобки

      let md;
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        md = await res.text();
      } catch (e) {
        htmlParts.push(
          `<section><h1 id="error-${i}">Ошибка загрузки: ${escapeHtml(path)}</h1><p>${escapeHtml(
            String(e)
          )}</p></section>`
        );
        continue;
      }

      // Замена %host% на domain
      md = md.replaceAll("%host%", resolvedDomain);

      // Рендерим разметку файла
      const fileHtml = marked.parse(md, { renderer });
      // Теперь нужно проставить id в h1 и собрать TOC
      const withAnchors = applyH1Anchors(fileHtml, i, toc);

      // Разделитель между файлами (необязательно)
      // htmlParts.push(`<hr style="border:0;border-top:1px dashed var(--border);margin:18px 0;">`);
      htmlParts.push(withAnchors);
    }

    // Склеенный HTML
    const finalHtml = htmlParts.join("\n");
    docEl.innerHTML = finalHtml;

    // Подсветка
    document.querySelectorAll("pre code").forEach((el) => {
      try { hljs.highlightElement(el); } catch (_) {}
    });

    // Кнопки "копировать"
    addCopyButtons();

    // Оглавление
    renderTOC(toc);
    statusEl.textContent = `Готово: загружено файлов — ${files.length}`;
  }

  function applyH1Anchors(html, fileIndex, tocTarget) {
    // ищем наши плейсхолдеры после каждого <h1>...</h1><!--__H1_PLACEHOLDER__::RAW-->
    return html.replace(
      /<h1>(.*?)<\/h1>\s*<!--__H1_PLACEHOLDER__::([\s\S]*?)-->/g,
      (_, innerHtml, rawText) => {
        // очищаем от возможных HTML внутри innerHtml для текста оглавления
        const temp = document.createElement("div");
        temp.innerHTML = innerHtml;
        const textContent = temp.textContent || temp.innerText || rawText;

        const id = makeId(fileIndex, rawText);
        tocTarget.push({ text: textContent, id });
        return `<h1 id="${id}">${innerHtml}</h1>`;
      }
    );
  }

  function renderTOC(items) {
    if (!items.length) {
      tocEl.innerHTML = `<div style="color:var(--muted)">В документах не найдено заголовков уровня #</div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(({ text, id }) => {
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = text;
      a.addEventListener("click", (e) => {
        // плавный скролл
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      });
      const wrap = document.createElement("div");
      wrap.className = "group";
      wrap.appendChild(a);
      frag.appendChild(wrap);
    });
    tocEl.innerHTML = "";
    tocEl.appendChild(frag);
  }

  function addCopyButtons() {
    const blocks = document.querySelectorAll("pre > code");
    blocks.forEach((code) => {
      const pre = code.parentElement;
      // Не добавлять повторно
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "Копировать";
      btn.addEventListener("click", async () => {
        const text = code.innerText;
        try {
          await navigator.clipboard.writeText(text);
          const old = btn.textContent;
          btn.textContent = "Скопировано!";
          setTimeout(() => (btn.textContent = old), 1200);
        } catch (_) {
          // fallback
          copyFallback(text);
        }
      });
      pre.appendChild(btn);
    });
  }

  function copyFallback(text) {
    const ta = document.createElement("textarea");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Старт
  loadAll().catch((e) => {
    statusEl.textContent = `Ошибка: ${String(e)}`;
    console.error(e);
  });
})();

