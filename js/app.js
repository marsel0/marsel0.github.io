class MarkdownViewer {
    constructor() {
        this.domain = this.getDomainFromUrl();
        this.init();
    }

    init() {
        this.loadAllFiles().then(() => {
            this.renderTOC();
            this.setupEventListeners();
        });
    }

    getDomainFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('domain') || 'example.com';
    }

    replaceDomain(content) {
        return content.replace(/%host%/g, this.domain);
    }

    async loadAllFiles() {
        try {
            const contentContainer = document.getElementById('markdown-content');
            contentContainer.innerHTML = '<div style="text-align: center; padding: 40px;">Загрузка документации...</div>';

            let allContent = '';
            
            // Загружаем все файлы последовательно
            for (const filePath of files) {
                try {
                    const response = await fetch(filePath);
                    if (!response.ok) continue;
                    
                    let content = await response.text();
                    content = this.replaceDomain(content);
                    allContent += content + '\n\n';
                } catch (error) {
                    console.warn(`Не удалось загрузить файл: ${filePath}`, error);
                }
            }

            if (!allContent.trim()) {
                throw new Error('Не удалось загрузить ни одного файла');
            }

            this.renderMarkdown(allContent);
            
        } catch (error) {
            console.error('Ошибка загрузки файлов:', error);
            document.getElementById('markdown-content').innerHTML = `
                <div style="color: #dc3545; text-align: center; padding: 40px;">
                    <h3>Ошибка загрузки документации</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    renderMarkdown(markdownText) {
        // Настраиваем marked с подсветкой кода
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });

        // Кастомный рендерер для code blocks
        const renderer = new marked.Renderer();
        const originalCodeRenderer = renderer.code;
        
        renderer.code = function(code, language, isEscaped) {
            const validLanguage = language && hljs.getLanguage(language) ? language : 'plaintext';
            const highlighted = originalCodeRenderer.call(this, code, validLanguage, isEscaped);
            
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${validLanguage}</span>
                        <button class="copy-btn" onclick="copyToClipboard(this)">Копировать</button>
                    </div>
                    ${highlighted}
                </div>
            `;
        };

        const html = marked.parse(markdownText, { renderer });
        document.getElementById('markdown-content').innerHTML = html;
        
        // Применяем подсветку ко всем блокам кода
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Добавляем якоря для заголовков
        this.addAnchorsToHeadings();
    }

    addAnchorsToHeadings() {
        const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4');
        
        headings.forEach(heading => {
            const id = heading.textContent
                .toLowerCase()
                .replace(/[^\wа-яё]+/gi, '-')
                .replace(/^-+|-+$/g, '');
            
            heading.id = id;
            
            const anchor = document.createElement('a');
            anchor.href = `#${id}`;
            anchor.className = 'heading-anchor';
            anchor.innerHTML = '#';
            anchor.style.marginLeft = '10px';
            anchor.style.opacity = '0.5';
            anchor.style.textDecoration = 'none';
            anchor.style.color = '#007bff';
            anchor.style.fontSize = '0.8em';
            
            heading.appendChild(anchor);
        });
    }

    renderTOC() {
        const tocContainer = document.getElementById('toc');
        const headings = document.querySelectorAll('.markdown-body h2, .markdown-body h3, .markdown-body h4');
        
        if (headings.length === 0) {
            tocContainer.innerHTML = '<p>Оглавление будет доступно после загрузки контента</p>';
            return;
        }

        let tocHTML = '<ul>';
        let currentLevel = 2;

        headings.forEach(heading => {
            const level = parseInt(heading.tagName.substring(1));
            const id = heading.id;
            const text = heading.textContent.replace('#', '').trim();

            if (level < currentLevel) {
                tocHTML += '</ul></li>';
            } else if (level > currentLevel) {
                tocHTML += '<ul>';
            }

            tocHTML += `
                <li class="h${level}">
                    <a href="#${id}">${text}</a>
                </li>
            `;

            currentLevel = level;
        });

        tocHTML += '</ul>';
        tocContainer.innerHTML = tocHTML;
    }

    setupEventListeners() {
        // Плавная прокрутка при клике на ссылки оглавления
        document.getElementById('toc').addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });

        // Обработка изменения хэша в URL
        window.addEventListener('hashchange', () => {
            this.scrollToAnchor();
        });

        // Прокрутка к якорю при загрузке страницы
        setTimeout(() => this.scrollToAnchor(), 100);
    }

    scrollToAnchor() {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

// Глобальная функция для копирования кода
function copyToClipboard(button) {
    const codeBlock = button.closest('.code-block').querySelector('pre code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Скопировано!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        button.textContent = 'Ошибка';
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownViewer();
});
