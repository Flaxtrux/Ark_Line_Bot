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
        const focusedValue = interaction.options.getFocused().toLowerCase();
        // Autocomplete desde los dinos YA registrados en la BD
        const todos = listDinos();
        const filtrados = todos
            .filter(d => d.criatura.toLowerCase().includes(focusedValue))
            .slice(0, 25);
        await interaction.respond(
            filtrados.map(d => ({ name: d.criatura, value: d.criatura }))
        );
    },

    async execute(interaction) {
        const criatura = interaction.options.getString('criatura');
        const dino = getDino(criatura);

        if (!dino) {
            return interaction.reply({
                content: `❌ No se encontraron datos para **${criatura}**. Usa \`/dino-add\` para registrarla primero.`,
                ephemeral: true
            });
        }

        await interaction.reply({ embeds: [buildDinoEmbed(dino)] });
    }
};
