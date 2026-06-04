const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'dinos.db'));

db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');

db.prepare(`
  CREATE TABLE IF NOT EXISTS dinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    criatura TEXT NOT NULL,
    hp INTEGER DEFAULT NULL,
    stamina INTEGER DEFAULT NULL,
    melee INTEGER DEFAULT NULL,
    peso INTEGER DEFAULT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, criatura)
  )
`).run();

try {
    db.prepare(`ALTER TABLE dinos ADD COLUMN guild_id TEXT NOT NULL DEFAULT 'legacy'`).run();
    console.log('✅ Columna guild_id añadida.');
} catch {
    // ya existe
}

console.log('✅ Base de datos lista.');

// solo estas columnas se pueden modificar
const COLUMNAS_PERMITIDAS = new Set(['hp', 'stamina', 'melee', 'peso']);

function getDino(guildId, criatura) {
    return db.prepare('SELECT * FROM dinos WHERE guild_id = ? AND criatura = ?').get(guildId, criatura);
}

function listDinos(guildId) {
    return db.prepare('SELECT * FROM dinos WHERE guild_id = ? ORDER BY criatura ASC').all(guildId);
}

function upsertDino(guildId, criatura, { hp, stamina, melee, peso }) {
    return db.prepare(`
        INSERT INTO dinos (guild_id, criatura, hp, stamina, melee, peso)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(guild_id, criatura) DO UPDATE SET
            hp      = COALESCE(excluded.hp,      hp),
            stamina = COALESCE(excluded.stamina, stamina),
            melee   = COALESCE(excluded.melee,   melee),
            peso    = COALESCE(excluded.peso,    peso)
    `).run(guildId, criatura, hp ?? null, stamina ?? null, melee ?? null, peso ?? null);
}

function updateDino(guildId, criatura, campos) {
    const invalidas = Object.keys(campos).filter(k => !COLUMNAS_PERMITIDAS.has(k));
    if (invalidas.length > 0) throw new Error(`Columnas no permitidas: ${invalidas.join(', ')}`);

    const sets = Object.keys(campos).map(k => `${k} = @${k}`).join(', ');
    return db.prepare(`UPDATE dinos SET ${sets} WHERE guild_id = @guildId AND criatura = @criatura`)
             .run({ ...campos, guildId, criatura });
}

function deleteDino(guildId, criatura) {
    return db.prepare('DELETE FROM dinos WHERE guild_id = ? AND criatura = ?').run(guildId, criatura);
}

module.exports = { getDino, listDinos, upsertDino, updateDino, deleteDino };
