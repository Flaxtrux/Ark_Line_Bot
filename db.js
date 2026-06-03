const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'dinos.db'));

db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');

// Creamos la tabla con la criatura/línea como eje principal y las stats en puntos enteros
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

console.log('✅ Base de datos SQLite adaptada correctamente.');

module.exports = db;
