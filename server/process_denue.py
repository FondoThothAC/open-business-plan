import zipfile
import csv
import json
import os
import io

def process_denue():
    zip_path = "/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/Inegi/denue_26_csv.zip"
    output_dir = "/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/server/data"
    output_file = os.path.join(output_dir, "denue_hermosillo.json")

    # Asegurar que el directorio de salida existe
    os.makedirs(output_dir, exist_ok=True)

    print(f"Procesando archivo: {zip_path}...")
    
    records = []
    
    with zipfile.ZipFile(zip_path, 'r') as z:
        # Abrir el archivo CSV dentro del ZIP
        with z.open('conjunto_de_datos/denue_inegi_26_.csv') as f:
            # Leer usando latin1 para evitar errores de codificación
            text_file = io.TextIOWrapper(f, encoding='latin1')
            reader = csv.DictReader(text_file)
            
            for row in reader:
                municipio = row.get('municipio', '').strip()
                # Filtrar únicamente por Hermosillo
                if municipio == 'Hermosillo':
                    # Parsear coordenadas de forma segura
                    try:
                        lat = float(row.get('latitud', 0))
                        lng = float(row.get('longitud', 0))
                    except (ValueError, TypeError):
                        lat, lng = 0.0, 0.0
                        
                    codigo_act = row.get('codigo_act', '').strip()
                    sector = codigo_act[:2] if len(codigo_act) >= 2 else ""

                    record = {
                        "id": row.get('id', '').strip(),
                        "nombre": row.get('nom_estab', '').strip() or row.get('raz_social', '').strip() or "Sin nombre",
                        "razon_social": row.get('raz_social', '').strip(),
                        "codigo_act": codigo_act,
                        "nombre_act": row.get('nombre_act', '').strip(),
                        "estrato": row.get('per_ocu', '').strip(),
                        "lat": lat,
                        "lng": lng,
                        "sector": sector
                    }
                    records.append(record)

    print(f"Extracción completada. Encontrados {len(records)} negocios en Hermosillo.")
    
    # Guardar en JSON optimizado
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(records, out, ensure_ascii=False, indent=2)
        
    print(f"Archivo guardado exitosamente en: {output_file}")

if __name__ == "__main__":
    process_denue()
