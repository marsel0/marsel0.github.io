import os
import json

# Папка с Markdown
docs_dir = "docs"

# Получаем список файлов .md
files = [f for f in os.listdir(docs_dir) if f.endswith(".md")]

# Сортируем по имени (чтобы 1_name, 2_name, 11_name, ...)
files.sort()

# Формируем JS-массив с путями к файлам
files_js = "const files = " + json.dumps([f"{docs_dir}/{f}" for f in files], ensure_ascii=False) + ";"

# Папка для JS
js_dir = "js"
os.makedirs(js_dir, exist_ok=True)

# Записываем файл
with open(os.path.join(js_dir, "files.js"), "w", encoding="utf-8") as f:
    f.write(files_js + "\n")

print(f"Файл js/files.js с {len(files)} файлами создан.")

