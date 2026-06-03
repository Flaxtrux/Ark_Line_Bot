const { EmbedBuilder } = require('discord.js');
const { IMAGENES } = require('./dinos-lista');

// URL de fallback si la criatura no está en el diccionario
const IMAGEN_FALLBACK = 'https://ark.wiki.gg/images/thumb/2/2b/ARK_Survival_Evolved.jpg/300px-ARK_Survival_Evolved.jpg';

/**
 * Genera una tarjeta visual estilizada (Embed) con los puntos del dinosaurio.
 * @param {string} criatura - Nombre del dinosaurio
 * @param {object} stats    - Objeto con las estadísticas (hp, stamina, melee, peso)
 * @returns {EmbedBuilder}
 */
function crearEmbedDino(criatura, stats) {
    const fmt = (val) => (val !== null && val !== undefined) ? `**${val}** pts` : '*No asignado*';
    const imagen = IMAGENES[criatura] ?? IMAGEN_FALLBACK;

    return new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle(`📊 Registro de Línea: ${criatura}`)
        .setThumbnail(imagen)
        .addFields(
            { name: '❤️ Vida (HP)',        value: fmt(stats.hp),      inline: true },
            { name: '⚡ Energía (Stamina)', value: fmt(stats.stamina), inline: true },
            { name: '⚔️ Daño (Melee)',      value: fmt(stats.melee),   inline: true },
            { name: '📦 Peso',              value: fmt(stats.peso),    inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'ARK Line Tracker Bot' });
}

// Alias para comandos que importan buildDinoEmbed(dinoRow)
function buildDinoEmbed(dinoRowOrCriatura, stats) {
    if (typeof dinoRowOrCriatura === 'object' && dinoRowOrCriatura.criatura) {
        return crearEmbedDino(dinoRowOrCriatura.criatura, dinoRowOrCriatura);
    }
    return crearEmbedDino(dinoRowOrCriatura, stats);
}

module.exports = { crearEmbedDino, buildDinoEmbed };
