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

    normalizeLanguage(language) {
        const languageMap = {
            'bash': 'bash',
            'sh': 'bash',
            'shell': 'bash',
            'curl': 'bash', // Обрабатываем curl как bash
            'json': 'json',
            'js': 'javascript',
            'javascript': 'javascript',
            'html': 'html',
            'xml': 'xml',
            'css': 'css',
            'python': 'python',
            'py': 'python',
            'php': 'php',
            'ruby': 'ruby',
            'rb': 'ruby',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'c++': 'cpp',
            'c#': 'csharp',
            'cs': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'rs': 'rust',
            'sql': 'sql',
            'yaml': 'yaml',
            'yml': 'yaml',
            'markdown': 'markdown',
            'md': 'markdown'
        };

        if (!language) return 'plaintext';
        
        const lang = language.toLowerCase().trim();
        return languageMap[lang] || 'plaintext';
    }

    getDisplayLanguage(language) {
        if (!language) return 'text';
        
        const lang = language.toLowerCase().trim();
        return lang === 'plaintext' ? 'text' : lang;
    }

    renderMarkdown(markdownText) {
        // Сначала обрабатываем код блоки самостоятельно
        const processedMarkdown = this.preprocessCodeBlocks(markdownText);
        
        // Настраиваем marked БЕЗ подсветки кода
        marked.setOptions({
            highlight: (code, language) => {
                // Не используем встроенную подсветку marked
                return code;
            },
            breaks: true,
            gfm: true
        });

        const html = marked.parse(processedMarkdown);
        document.getElementById('markdown-content').innerHTML = html;
        
        // Теперь вручную применяем подсветку ко всем блокам кода
        this.highlightAllCodeBlocks();
        
        // Добавляем якоря для заголовков
        this.addAnchorsToHeadings();
    }

    preprocessCodeBlocks(markdownText) {
        // Регулярное выражение для нахождения блоков кода
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        
        return markdownText.replace(codeBlockRegex, (match, language, code) => {
            const normalizedLang = this.normalizeLanguage(language);
            const displayLang = this.getDisplayLanguage(language || normalizedLang);
            
            return `\n\n<div class="custom-code-block" data-language="${normalizedLang}" data-display="${displayLang}">\n${code.trim()}\n</div>\n\n`;
        });
    }

    highlightAllCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.custom-code-block');
        
        codeBlocks.forEach(block => {
            const code = block.textContent;
            const language = block.getAttribute('data-language');
            const displayLanguage = block.getAttribute('data-display');
            
            let highlightedCode = code;
            
            if (language && language !== 'plaintext' && hljs.getLanguage(language)) {
                try {
                    highlightedCode = hljs.highlight(code, { language }).value;
                } catch (e) {
                    console.warn(`Ошибка подсветки для языка ${language}:`, e);
                    highlightedCode = hljs.highlightAuto(code).value;
                }
            } else {
                highlightedCode = hljs.highlightAuto(code).value;
            }
            
            const codeContainer = document.createElement('div');
            codeContainer.className = 'code-block';
            codeContainer.innerHTML = `
                <div class="code-header">
                    <span class="code-language" data-language="${displayLanguage}">${displayLanguage}</span>
                    <button class="copy-btn">Копировать</button>
                </div>
                <pre><code class="hljs language-${language}">${highlightedCode}</code></pre>
            `;
            
            // Заменяем исходный блок на оформленный
            block.parentNode.replaceChild(codeContainer, block);
            
            // Добавляем обработчик кнопки копирования
            const copyBtn = codeContainer.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => this.copyToClipboard(copyBtn));
        });
    }

    copyToClipboard(button) {
        const codeBlock = button.closest('.code-block').querySelector('code');
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

        window.addEventListener('hashchange', () => {
            this.scrollToAnchor();
        });

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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownViewer();
});
