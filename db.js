const Database = require('better-sqlite3');
const path = require('path');

// Conexión centralizada al archivo mapeado por Docker
const db = new Database(path.join(__dirname, 'dinos.db'));

// Optimización para evitar bloqueos en entornos de alta lectura/escritura
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');

// Creamos la tabla adaptada. Quitamos 'linea' y dejamos 'criatura' como clave única.
db.prepare(`
  CREATE TABLE IF NOT EXISTS dinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criatura TEXT NOT NULL UNIQUE,
    hp INTEGER DEFAULT NULL,
    stamina INTEGER DEFAULT NULL,
    melee INTEGER DEFAULT NULL,
    peso INTEGER DEFAULT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log('✅ Base de datos SQLite inicializada correctamente.');

module.exports = db;
