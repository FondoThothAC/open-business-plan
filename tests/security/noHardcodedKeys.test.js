import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('TDD: Seguridad y Ausencia de API Keys Hardcodeadas', async (t) => {
  const dirsToScan = ['src', 'server', 'scripts'];
  const sensitiveRegexes = [
    /sk-[a-zA-Z0-9_-]{20,}/g,
    /tvly-[a-zA-Z0-9_-]{20,}/g,
    /BSA[a-zA-Z0-9_-]{20,}/g
  ];

  const foundViolations = [];

  function scanFolder(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
          scanFolder(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const regex of sensitiveRegexes) {
          const matches = content.match(regex);
          if (matches) {
            // Filtrar falsos positivos de pruebas o placeholders explícitos
            const realMatches = matches.filter(m => !m.includes('test_') && !m.includes('placeholder') && !m.includes('example'));
            if (realMatches.length > 0) {
              foundViolations.push({ file: fullPath, matches: realMatches });
            }
          }
        }
      }
    }
  }

  for (const dir of dirsToScan) {
    scanFolder(path.resolve(dir));
  }

  assert.equal(
    foundViolations.length, 
    0, 
    `Se encontraron claves API hardcodeadas en los siguientes archivos: ${JSON.stringify(foundViolations, null, 2)}`
  );
});
