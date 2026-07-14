import zipfile
import csv
import json
import os
import io
import glob

def process_denue():
    source_dir = "/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/Datos Fuentes"
    output_dir = "/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/server/data"
    output_file = os.path.join(output_dir, "denue_hermosillo.json")

    # Asegurar que el directorio de salida existe
    os.makedirs(output_dir, exist_ok=True)

    records = {}
    
    print(f"Buscando fuentes de datos DENUE en: {source_dir}...")
    
    # Procesar carpetas descomprimidas
    for folder_name in os.listdir(source_dir):
        if not folder_name.startswith("denue_"):
            continue
        
        folder_path = os.path.join(source_dir, folder_name)
        if os.path.isdir(folder_path):
            csv_glob = os.path.join(folder_path, "conjunto_de_datos", "*.csv")
            csv_files = glob.glob(csv_glob)
            for csv_file in csv_files:
                print(f"Procesando carpeta: {csv_file}...")
                try:
                    with open(csv_file, 'r', encoding='latin1') as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            mun = row.get('municipio', '').strip()
                            if mun.lower() == 'hermosillo':
                                record_id = row.get('id', '').strip()
                                if not record_id or record_id in records:
                                    continue
                                try:
                                    lat = float(row.get('latitud', 0))
                                    lng = float(row.get('longitud', 0))
                                except (ValueError, TypeError):
                                    lat, lng = 0.0, 0.0
                                    
                                codigo_act = row.get('codigo_act', '').strip()
                                sector = codigo_act[:2] if len(codigo_act) >= 2 else ""
                                
                                records[record_id] = {
                                    "id": record_id,
                                    "nombre": row.get('nom_estab', '').strip() or row.get('raz_social', '').strip() or "Sin nombre",
                                    "razon_social": row.get('raz_social', '').strip(),
                                    "codigo_act": codigo_act,
                                    "nombre_act": row.get('nombre_act', '').strip(),
                                    "estrato": row.get('per_ocu', '').strip(),
                                    "lat": lat,
                                    "lng": lng,
                                    "sector": sector
                                }
                except Exception as e:
                    print(f"Error procesando {csv_file}: {e}")
                    
        # Procesar archivos ZIP
        elif folder_name.endswith(".zip") and folder_name.startswith("denue_"):
            zip_path = os.path.join(source_dir, folder_name)
            print(f"Procesando ZIP: {zip_path}...")
            try:
                with zipfile.ZipFile(zip_path, 'r') as z:
                    for name in z.namelist():
                        if "conjunto_de_datos/" in name and name.endswith(".csv"):
                            with z.open(name) as f:
                                text_file = io.TextIOWrapper(f, encoding='latin1')
                                reader = csv.DictReader(text_file)
                                for row in reader:
                                    mun = row.get('municipio', '').strip()
                                    if mun.lower() == 'hermosillo':
                                        record_id = row.get('id', '').strip()
                                        if not record_id or record_id in records:
                                            continue
                                        try:
                                            lat = float(row.get('latitud', 0))
                                            lng = float(row.get('longitud', 0))
                                        except (ValueError, TypeError):
                                            lat, lng = 0.0, 0.0
                                            
                                        codigo_act = row.get('codigo_act', '').strip()
                                        sector = codigo_act[:2] if len(codigo_act) >= 2 else ""
                                        
                                        records[record_id] = {
                                            "id": record_id,
                                            "nombre": row.get('nom_estab', '').strip() or row.get('raz_social', '').strip() or "Sin nombre",
                                            "razon_social": row.get('raz_social', '').strip(),
                                            "codigo_act": codigo_act,
                                            "nombre_act": row.get('nombre_act', '').strip(),
                                            "estrato": row.get('per_ocu', '').strip(),
                                            "lat": lat,
                                            "lng": lng,
                                            "sector": sector
                                        }
            except Exception as e:
                print(f"Error procesando ZIP {zip_path}: {e}")

    final_list = list(records.values())
    print(f"Extracción completada. Total de negocios en Hermosillo: {len(final_list)}")
    
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(final_list, out, ensure_ascii=False, indent=2)
        
    print(f"Archivo guardado exitosamente en: {output_file}")

if __name__ == "__main__":
    process_denue()
