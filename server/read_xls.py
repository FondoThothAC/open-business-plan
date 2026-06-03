import xlrd

def inspect_xls():
    file_path = "/Users/robertoeduardocelisrobles/Documents/FT Apps/open-business-plan-v2.5.12.3/Corrida-cibercafe-fappa-promete-2015-G.xls"
    
    workbook = xlrd.open_workbook(file_path)
    sheet_names = workbook.sheet_names()
    print("Hojas encontradas:")
    for name in sheet_names:
        print(f"- {name}")
        
    print("\n--- Detalles de cada hoja (primeras 10 filas y columnas) ---")
    for name in sheet_names:
        sheet = workbook.sheet_by_name(name)
        print(f"\nHoja: {name} (Filas: {sheet.nrows}, Columnas: {sheet.ncols})")
        for r in range(min(15, sheet.nrows)):
            row_vals = [sheet.cell_value(r, c) for c in range(min(8, sheet.ncols))]
            # Filtrar si está vacía
            if any(str(v).strip() for v in row_vals):
                print(f"Fila {r}: {row_vals}")

if __name__ == "__main__":
    inspect_xls()
