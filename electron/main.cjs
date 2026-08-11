// [SDD] Electron Main Process — OpenBusinessPlan v3.0
// [TDD] Detecta: modo dev vs producción, rutas de servidor, limpieza al cerrar
// [UXDD] Ventana de splash mientras carga el backend

const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let splashWindow = null;
let serverProcess = null;

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// ─── Ruta al servidor (producción usa extraResources) ────────────────────────
function getServerPath() {
  if (isDev) {
    return path.join(__dirname, '../server/index.js');
  }
  // En producción, electron-builder copia server/ a resources/server/
  return path.join(process.resourcesPath, 'server', 'index.js');
}

// ─── Polling de salud del backend (reemplaza wait-on) ────────────────────────
function waitForServer(url, maxRetries = 30, intervalMs = 500) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const check = () => {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error(`Server did not start after ${maxRetries} retries`));
        } else {
          setTimeout(check, intervalMs);
        }
      });
    };
    check();
  });
}

// ─── Ventana Splash ──────────────────────────────────────────────────────────
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    backgroundColor: '#0f172a',
  });

  // HTML inline del splash (sin archivos externos)
  const splashHTML = `data:text/html;charset=utf-8,<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
    color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100vh; gap: 20px;
  }
  .logo { font-size: 48px; }
  h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  p { font-size: 13px; opacity: 0.6; }
  .bar-wrap { width: 280px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
  .bar { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 2px;
         animation: fill 3s ease-in-out infinite; }
  @keyframes fill { 0%{width:0%} 80%{width:90%} 100%{width:90%} }
</style>
</head>
<body>
  <div class="logo">📊</div>
  <h1>OpenBusinessPlan</h1>
  <p>Iniciando sistema...</p>
  <div class="bar-wrap"><div class="bar"></div></div>
</body>
</html>`;

  splashWindow.loadURL(splashHTML);
}

// ─── Ventana Principal ───────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false, // se muestra después del splash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    title: 'Open Business Plan',
    backgroundColor: '#0f172a',
  });

  // Abrir links externos en el browser del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// ─── Inicio del backend Node.js ──────────────────────────────────────────────
function startBackend() {
  const serverScript = getServerPath();

  serverProcess = spawn(process.execPath, [serverScript], {
    env: { ...process.env, PORT: '3001', NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (d) => console.log('[Server]', d.toString().trim()));
  serverProcess.stderr.on('data', (d) => console.error('[Server ERR]', d.toString().trim()));

  serverProcess.on('error', (err) => {
    console.error('Backend spawn error:', err);
    dialog.showErrorBox('Error del Servidor', `No se pudo iniciar el servidor backend:\n${err.message}`);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`Backend exited with code ${code}`);
    }
  });
}

// ─── Ciclo de vida de la app ─────────────────────────────────────────────────
app.on('ready', async () => {
  createSplashWindow();

  if (!isDev) {
    startBackend();
  }

  const loadUrl = isDev ? 'http://localhost:5173' : 'http://localhost:3001';
  const healthUrl = isDev ? 'http://localhost:5173' : 'http://localhost:3001/api/projects';

  try {
    await waitForServer(healthUrl, 40, 500);
  } catch (err) {
    console.warn('Health check timeout, loading anyway:', err.message);
  }

  const win = createMainWindow();
  await win.loadURL(loadUrl);

  win.show();

  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close();
    splashWindow = null;
  }

  if (isDev) {
    win.webContents.openDevTools();
  }
});

app.on('window-all-closed', () => {
  killBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// ─── Limpieza del proceso backend ────────────────────────────────────────────
function killBackend() {
  if (serverProcess && !serverProcess.killed) {
    try {
      serverProcess.kill('SIGTERM');
    } catch (_) {}
    serverProcess = null;
  }
}

process.on('exit', killBackend);
process.on('SIGINT', () => { killBackend(); process.exit(0); });
process.on('SIGTERM', () => { killBackend(); process.exit(0); });
