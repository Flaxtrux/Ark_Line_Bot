const { SlashCommandBuilder } = require('discord.js');
const { getDino, listDinos } = require('../db');
const { buildDinoEmbed } = require('../embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-stats')
        .setDescription('Muestra la ficha técnica de una línea de crianza')
        .addStringOption(o =>
            o.setName('criatura')
             .setDescription('Selecciona la criatura a consultar')
             .setRequired(true)
             .setAutocomplete(true)),

    async autocomplete(interaction) {
        try {
            const focusedValue = (interaction.options.getFocused() ?? '').toLowerCase();
            const todos = listDinos(interaction.guildId);
            const filtrados = todos.filter(d => d.criatura.toLowerCase().includes(focusedValue)).slice(0, 25);
            await interaction.respond(filtrados.map(d => ({ name: d.criatura, value: d.criatura })));
        } catch {
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const criatura = interaction.options.getString('criatura');
        if (!criatura) return interaction.reply({ content: '⚠️ Selecciona una criatura de la lista.', ephemeral: true });

        const dino = getDino(interaction.guildId, criatura);
        if (!dino) return interaction.reply({ content: `❌ No hay registro para **${criatura}**. Usa \`/dino-add\` primero.`, ephemeral: true });

        await interaction.reply({ embeds: [buildDinoEmbed(dino)] });
    }
};
