const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { listDinos } = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-list')
        .setDescription('Muestra un índice con todas las líneas registradas'),

    async execute(interaction) {
        const dinos = listDinos();

        if (dinos.length === 0) {
            return interaction.reply({
                content: '📭 Aún no hay ninguna línea registrada. Usa `/dino-add` para empezar.',
                ephemeral: true
            });
        }

        const fmt = (val) => (val !== null && val !== undefined) ? val : '—';

        const listaTexto = dinos
            .map(d => `🦕 **${d.criatura}** — HP: ${fmt(d.hp)} | Stamina: ${fmt(d.stamina)} | Melee: ${fmt(d.melee)} | Peso: ${fmt(d.peso)}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle(`📋 Líneas de Crianza Registradas (${dinos.length})`)
            .setDescription(listaTexto)
            .setFooter({ text: 'Usa /dino-stats para ver la ficha completa de una criatura.' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
