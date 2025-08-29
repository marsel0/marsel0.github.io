class MarkdownViewer {
    constructor() {
        this.currentFile = null;
        this.init();
    }

    init() {
        this.renderFileList();
        this.loadFirstFile();
        this.setupEventListeners();
    }

    renderFileList() {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';

        files.forEach(file => {
            const li = document.createElement('li');
            const fileName = this.getFileName(file);
            
            li.innerHTML = `
                <a href="#" data-file="${file}" class="file-link">
                    ${fileName}
                </a>
            `;
            fileList.appendChild(li);
        });
    }

    getFileName(filePath) {
        // Извлекаем имя файла без пути и расширения
        const fileName = filePath.split('/').pop().replace('.md', '');
        // Убираем номера в скобках, если они есть
        return fileName.replace(/\s*\(\d+\)$/, '');
    }

    loadFirstFile() {
        if (files.length > 0) {
            this.loadFile(files[0]);
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-link')) {
                e.preventDefault();
                const file = e.target.getAttribute('data-file');
                this.loadFile(file);
                
                // Обновляем активный элемент
                document.querySelectorAll('.file-link').forEach(link => {
                    link.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });

        // Обработка хэша в URL для глубоких ссылок
        window.addEventListener('hashchange', () => {
            this.scrollToAnchor();
        });
    }

    async loadFile(filePath) {
        try {
            this.currentFile = filePath;
            
            // Показываем индикатор загрузки
            document.getElementById('markdown-content').innerHTML = 
                '<div style="text-align: center; padding: 40px;">Загрузка...</div>';

            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки файла: ${response.status}`);
            }

            const markdownText = await response.text();
            this.renderMarkdown(markdownText);
            
            // Обновляем URL с хэшем
            const fileName = this.getFileName(filePath);
            window.location.hash = fileName;

        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            document.getElementById('markdown-content').innerHTML = `
                <div style="color: #dc3545; text-align: center; padding: 40px;">
                    <h3>Ошибка загрузки файла</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    renderMarkdown(markdownText) {
        // Конфигурация marked для правильного рендеринга
        marked.setOptions({
            highlight: function(code, lang) {
                // Здесь можно добавить подсветку синтаксиса, если нужно
                return code;
            },
            breaks: true,
            gfm: true
        });

        const html = marked.parse(markdownText);
        document.getElementById('markdown-content').innerHTML = html;
        
        // Добавляем якоря для заголовков
        this.addAnchorsToHeadings();
        
        // Прокручиваем к якорю, если он есть в URL
        this.scrollToAnchor();
    }

    addAnchorsToHeadings() {
        const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3');
        
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
            anchor.style.opacity = '0.3';
            anchor.style.textDecoration = 'none';
            anchor.style.color = '#007bff';
            
            heading.appendChild(anchor);
        });
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
