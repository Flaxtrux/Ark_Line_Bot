const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { listDinos } = require('../db');

const MAX_DESC = 4000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-list')
        .setDescription('Muestra un índice con todas las líneas registradas'),

    async execute(interaction) {
        const dinos = listDinos(interaction.guildId);

        if (dinos.length === 0) return interaction.reply({ content: '📭 Aún no hay ninguna línea registrada. Usa `/dino-add` para empezar.', ephemeral: true });

        const fmt = (val) => (val !== null && val !== undefined) ? val : '—';

        let desc = '';
        let truncado = false;
        for (const d of dinos) {
            const linea = `🦕 **${d.criatura}** — HP: ${fmt(d.hp)} | Stamina: ${fmt(d.stamina)} | Melee: ${fmt(d.melee)} | Peso: ${fmt(d.peso)}\n`;
            if (desc.length + linea.length > MAX_DESC) {
                desc += `*...y más. Usa \`/dino-stats\` para consultar individualmente.*`;
                truncado = true;
                break;
            }
            desc += linea;
        }

        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle(`📋 Líneas de Crianza Registradas (${dinos.length})`)
            .setDescription(desc)
            .setFooter({ text: truncado ? 'Lista truncada.' : 'Usa /dino-stats para la ficha completa.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
