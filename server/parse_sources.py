import os
import urllib.request
from pypdf import PdfReader

# Directorios de trabajo
DATOS_FUENTES_DIR = './Datos Fuentes'
WAGE_PDF_URL = 'https://www.gob.mx/cms/uploads/attachment/file/1041076/Tabla_de_Salarios_M_nimos_2026.pdf'
WAGE_PDF_PATH = os.path.join(DATOS_FUENTES_DIR, 'Tabla_de_Salarios_Minimos_2026.pdf')

def download_wage_pdf():
    print(f"📥 Descargando Tabulación de Salarios Mínimos 2026 desde gob.mx...")
    try:
        if not os.path.exists(DATOS_FUENTES_DIR):
            os.makedirs(DATOS_FUENTES_DIR)
            
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(WAGE_PDF_URL, headers=headers)
        with urllib.request.urlopen(req) as response, open(WAGE_PDF_PATH, 'wb') as out_file:
            out_file.write(response.read())
        print(f"✅ Descargado con éxito en: {WAGE_PDF_PATH}")
    except Exception as e:
        print(f"❌ Error al descargar el PDF de salarios: {e}")

def convert_pdf_to_md(pdf_path, md_path):
    print(f"📄 Convirtiendo PDF a Markdown: {os.path.basename(pdf_path)}...")
    try:
        reader = PdfReader(pdf_path)
        content = []
        content.append(f"# Documento de Referencia: {os.path.basename(pdf_path)}\n")
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                content.append(f"## Página {i+1}\n\n{text}\n")
                
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(content))
        print(f"✅ Conversión completa: {md_path}")
    except Exception as e:
        print(f"❌ Error al convertir {pdf_path}: {e}")

def main():
    if not os.path.exists(DATOS_FUENTES_DIR):
        os.makedirs(DATOS_FUENTES_DIR)

    # 1. Descargar el tabulado si no existe
    if not os.path.exists(WAGE_PDF_PATH):
        download_wage_pdf()
    else:
        print(f"ℹ️ El PDF de salarios mínimos ya existe en {WAGE_PDF_PATH}")

    # 2. Convertir todos los archivos PDF en 'Datos Fuentes' a .md
    for file in os.listdir(DATOS_FUENTES_DIR):
        if file.endswith('.pdf'):
            pdf_path = os.path.join(DATOS_FUENTES_DIR, file)
            md_name = file.replace('.pdf', '.md').replace(' ', '_')
            md_path = os.path.join(DATOS_FUENTES_DIR, md_name)
            
            # Si no existe o es de tamaño 0, lo convertimos
            if not os.path.exists(md_path) or os.path.getsize(md_path) == 0:
                convert_pdf_to_md(pdf_path, md_path)
            else:
                print(f"⏩ Saltando {file} (ya existe versión .md)")

if __name__ == '__main__':
    main()
