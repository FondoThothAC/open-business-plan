import os
from pypdf import PdfReader

dir_path = './PLAN MICROFINA'
for file in os.listdir(dir_path):
    if file.endswith('.pdf'):
        file_path = os.path.join(dir_path, file)
        try:
            reader = PdfReader(file_path)
            first_page = reader.pages[0].extract_text()
            print(f"=== FILE: {file} ===")
            print(first_page[:1000])
            print("===================================\n")
        except Exception as e:
            print(f"Error reading {file}: {e}")
