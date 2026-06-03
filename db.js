const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'dinos.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS dinos (
    id TEXT PRIMARY KEY,
    nombre TEXT,
    especie TEXT,
    nivel INTEGER DEFAULT 1,
    imagen_url TEXT,
    hp INTEGER DEFAULT 0,
    stamina INTEGER DEFAULT 0,
    oxigeno INTEGER DEFAULT 0,
    peso INTEGER DEFAULT 0,
    melee INTEGER DEFAULT 0,
    servidor TEXT,
    tribu TEXT,
    guild_id TEXT
  )
`);

// Lista blanca de columnas para evitar SQL Injection en las actualizaciones
const ALLOWED_COLUMNS = ['hp', 'stamina', 'peso', 'melee'];

module.exports = {
  addDino(dino) {
    const stmt = db.prepare(`
      INSERT INTO dinos (id, nombre, especie, nivel, imagen_url, hp, stamina, oxigeno, peso, melee, servidor, tribu, guild_id)
      VALUES (@id, @nombre, @especie, @nivel, @imagen_url, @hp, @stamina, @oxigeno, @peso, @melee, @servidor, @tribu, @guild_id)
    `);
    return stmt.run(dino);
  },

  getDino(nombre, guildId) {
    const stmt = db.prepare('SELECT * FROM dinos WHERE LOWER(nombre) = LOWER(?) AND guild_id = ?');
    return stmt.get(nombre, guildId);
  },

  listDinos(guildId) {
    const stmt = db.prepare('SELECT * FROM dinos WHERE guild_id = ? ORDER BY nombre ASC');
    return stmt.all(guildId);
  },

  updateDino(nombre, guildId, campos) {
    const assignments = [];
    const values = [];

    for (const [columna, valor] of Object.entries(campos)) {
      if (ALLOWED_COLUMNS.includes(columna)) {
        assignments.push(`${columna} = ?`);
        values.push(valor);
      }
    }

    if (assignments.length === 0) return { changes: 0 };

    values.push(nombre, guildId);
    const stmt = db.prepare(`
      UPDATE dinos 
      SET ${assignments.join(', ')} 
      WHERE LOWER(nombre) = LOWER(?) AND guild_id = ?
    `);
    return stmt.run(...values);
  },

  deleteDino(nombre, guildId) {
    const stmt = db.prepare('DELETE FROM dinos WHERE LOWER(nombre) = LOWER(?) AND guild_id = ?');
    return stmt.run(nombre, guildId);
  }
};
