const { EmbedBuilder } = require('discord.js');

/**
 * Genera una tarjeta visual estilizada (Embed) con los puntos del dinosaurio.
 * @param {string} criatura - Nombre del dinosaurio
 * @param {object} stats    - Objeto con las estadísticas (hp, stamina, melee, peso)
 * @returns {EmbedBuilder}
 */
function crearEmbedDino(criatura, stats) {
    const fmt = (val) => (val !== null && val !== undefined) ? `**${val}** pts` : '*No asignado*';

    return new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle(`📊 Registro de Línea: ${criatura}`)
        .addFields(
            { name: '❤️ Vida (HP)',            value: fmt(stats.hp),      inline: true },
            { name: '⚡ Energía (Stamina)',     value: fmt(stats.stamina), inline: true },
            { name: '⚔️ Daño (Melee)',          value: fmt(stats.melee),   inline: true },
            { name: '📦 Peso',                  value: fmt(stats.peso),    inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'ARK Line Tracker Bot' });
}

// Alias para compatibilidad con los comandos que ya importan buildDinoEmbed
// Acepta tanto (criatura, stats) como (dinoRow) donde dinoRow.criatura existe
function buildDinoEmbed(dinoRowOrCriatura, stats) {
    if (typeof dinoRowOrCriatura === 'object' && dinoRowOrCriatura.criatura) {
        // Llamada con un solo objeto fila de la BD: buildDinoEmbed(dino)
        return crearEmbedDino(dinoRowOrCriatura.criatura, dinoRowOrCriatura);
    }
    // Llamada con dos parámetros: buildDinoEmbed(criatura, stats)
    return crearEmbedDino(dinoRowOrCriatura, stats);
}

module.exports = { crearEmbedDino, buildDinoEmbed };
