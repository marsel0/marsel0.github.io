import os
import json

def generate_files_js():
    docs_dir = 'docs'
    files = []
    
    # Получаем все .md файлы из папки docs
    for file in os.listdir(docs_dir):
        if file.endswith('.md'):
            files.append(f"docs/{file}")
    
    # Сортируем файлы для удобства
    files.sort()
    
    # Генерируем содержимое файла
    content = f"const files = {json.dumps(files, indent=2)};"
    
    # Записываем в файл
    with open('js/files.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Сгенерирован файл js/files.js с {len(files)} файлами")

if __name__ == "__main__":
    generate_files_js()
