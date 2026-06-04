const { EmbedBuilder } = require('discord.js');
const { IMAGENES } = require('./dinos-lista');

const IMAGEN_FALLBACK = 'https://ark.wiki.gg/images/thumb/2/2b/ARK_Survival_Evolved.jpg/300px-ARK_Survival_Evolved.jpg';

function crearEmbedDino(criatura, stats) {
    const s = stats ?? {};
    const fmt = (val) => (val !== null && val !== undefined) ? `**${val}** pts` : '*No asignado*';

    return new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle(`📊 Registro de Línea: ${criatura}`)
        .setThumbnail(IMAGENES[criatura] ?? IMAGEN_FALLBACK)
        .addFields(
            { name: '❤️ Vida (HP)',         value: fmt(s.hp),      inline: true },
            { name: '⚡ Energía (Stamina)',  value: fmt(s.stamina), inline: true },
            { name: '⚔️ Daño (Melee)',       value: fmt(s.melee),   inline: true },
            { name: '📦 Peso',               value: fmt(s.peso),    inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'ARK Line Tracker Bot' });
}

// acepta tanto una fila de la BD como (criatura, stats) por separado
function buildDinoEmbed(dinoRowOrCriatura, stats) {
    if (typeof dinoRowOrCriatura === 'object' && dinoRowOrCriatura !== null && dinoRowOrCriatura.criatura) {
        return crearEmbedDino(dinoRowOrCriatura.criatura, dinoRowOrCriatura);
    }
    return crearEmbedDino(dinoRowOrCriatura, stats);
}

module.exports = { crearEmbedDino, buildDinoEmbed };
