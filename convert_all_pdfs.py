import os
from pypdf import PdfReader

source_dir = './PLAN MICROFINA'
dest_dir = './ejemplos_historicos'

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for file in os.listdir(source_dir):
    if file.endswith('.pdf'):
        file_path = os.path.join(source_dir, file)
        md_name = file.replace('.pdf', '.md').replace(' ', '_').replace('...', '').replace('́', '')
        dest_path = os.path.join(dest_dir, md_name)
        
        # If it already exists, check if it's large (like the docx ones). Only generate if missing or small.
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
            print(f"Skipping already converted: {md_name}")
            continue
            
        print(f"Converting: {file} to {md_name}...")
        try:
            reader = PdfReader(file_path)
            content = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    content.append(f"## Page {i+1}\n\n{text}\n")
            
            with open(dest_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(content))
            print(f"✅ Converted: {md_name}")
        except Exception as e:
            print(f"❌ Error converting {file}: {e}")
