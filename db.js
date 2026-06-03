const Database = require('better-sqlite3');
const path = require('path');

// Conectamos a la base de datos (se creará el archivo dinos.db si no existe)
const db = new Database(path.join(__dirname, 'dinos.db'), { 
    verbose: console.log // Esto te mostrará en los logs de Docker cada consulta que haga el bot
});

// Configuramos SQLite para que sea más rápido y seguro en entornos Docker
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');

// Creamos la tabla de dinos con los campos de estadísticas como OPCIONALES (NULL)
// y preparados para almacenar números enteros (puntos de nivel)
db.prepare(`
  CREATE TABLE IF NOT EXISTS dinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    linea TEXT NOT NULL,
    criatura TEXT NOT NULL,
    hp INTEGER DEFAULT NULL,
    stamina INTEGER DEFAULT NULL,
    melee INTEGER DEFAULT NULL,
    peso INTEGER DEFAULT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log('✅ Base de datos SQLite inicializada correctamente.');

module.exports = db;
