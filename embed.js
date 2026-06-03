const { EmbedBuilder } = require('discord.js');

/**
 * Genera una tarjeta visual estilizada (Embed) con los puntos del dinosaurio.
 * @param {string} criatura Nombre del dinosaurio
 * @param {object} stats Objeto con las estadísticas (hp, stamina, melee, peso)
 */
function crearEmbedDino(criatura, stats) {
    const formatear = (val) => val !== null ? `**${val}** pts` : '*No asignado*';

    return new EmbedBuilder()
        .setColor('#00FF7F') // Verde ARK elegante
        .setTitle(`📊 Registro de Línea: ${criatura}`)
        .addFields(
            { name: '❤️ Vida (HP)', value: formatear(stats.hp), inline: true },
            { name: '⚡ Energía (Stamina)', value: formatear(stats.stamina), inline: true },
            { name: '⚔️ Daño (Melee)', value: formatear(stats.melee), inline: true },
            { name: '📦 Peso', value: formatear(stats.peso), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'ARK Line Tracker Bot' });
}

module.exports = { crearEmbedDino };
