const Database = require('better-sqlite3');
const path = require('path');

// Conexión centralizada al archivo mapeado por Docker
const db = new Database(path.join(__dirname, 'dinos.db'));

// Optimización para evitar bloqueos en entornos de alta lectura/escritura
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');

// Creamos la tabla adaptada. 'criatura' como clave única.
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

// ─── Métodos de acceso ───────────────────────────────────────────────────────

/** Devuelve una fila por nombre de criatura, o undefined si no existe. */
function getDino(criatura) {
    return db.prepare('SELECT * FROM dinos WHERE criatura = ?').get(criatura);
}

/** Devuelve todas las criaturas registradas, ordenadas alfabéticamente. */
function listDinos() {
    return db.prepare('SELECT * FROM dinos ORDER BY criatura ASC').all();
}

/**
 * Inserta o actualiza una criatura.
 * Solo sobreescribe los campos que se pasen como no-null.
 */
function upsertDino(criatura, { hp, stamina, melee, peso }) {
    return db.prepare(`
        INSERT INTO dinos (criatura, hp, stamina, melee, peso)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(criatura) DO UPDATE SET
            hp      = COALESCE(excluded.hp,      hp),
            stamina = COALESCE(excluded.stamina, stamina),
            melee   = COALESCE(excluded.melee,   melee),
            peso    = COALESCE(excluded.peso,    peso)
    `).run(criatura, hp ?? null, stamina ?? null, melee ?? null, peso ?? null);
}

/**
 * Actualiza campos concretos de una criatura existente.
 * @param {string} criatura
 * @param {object} campos - Objeto con las columnas a actualizar y sus nuevos valores
 */
function updateDino(criatura, campos) {
    const sets = Object.keys(campos).map(k => `${k} = @${k}`).join(', ');
    return db.prepare(`UPDATE dinos SET ${sets} WHERE criatura = @criatura`)
             .run({ ...campos, criatura });
}

/** Elimina una criatura. Devuelve { changes: 1 } si existía, { changes: 0 } si no. */
function deleteDino(criatura) {
    return db.prepare('DELETE FROM dinos WHERE criatura = ?').run(criatura);
}

module.exports = { getDino, listDinos, upsertDino, updateDino, deleteDino };
