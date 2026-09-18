// ─────────────────────────────────────────────────────────
//  ecosystem.config.cjs — Configuración de PM2 para OBP
//  Mantiene el proceso Node.js vivo en el VPS Oracle Cloud
// ─────────────────────────────────────────────────────────
module.exports = {
  apps: [{
    name: 'obp-backend',
    script: 'server/index.js',
    // Directorio de trabajo: ruta absoluta en el VPS
    // Ajustar si se clona en otra ruta
    cwd: '/opt/obp',
    instances: 1,
    autorestart: true,
    watch: false,
    // Oracle Micro E2 tiene ~1GB RAM; limitar el proceso
    max_memory_restart: '256M',
    // Variables de entorno de producción
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '127.0.0.1'
    },
    // PM2 carga automáticamente .env.local si se especifica
    env_file: '.env.local',
    // Logs con timestamp para debugging
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    time: true,
    // Reinicio inteligente: backoff exponencial
    exp_backoff_restart_delay: 100
  }]
};
