const { SlashCommandBuilder } = require('discord.js');
const { getDino, deleteDino, listDinos } = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-delete')
        .setDescription('Elimina permanentemente una línea del registro')
        .addStringOption(o =>
            o.setName('criatura')
             .setDescription('Selecciona la criatura a borrar')
             .setRequired(true)
             .setAutocomplete(true)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
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
                content: `❌ No existe ningún registro de **${criatura}**.`,
                ephemeral: true
            });
        }

        deleteDino(criatura);

        await interaction.reply({
            content: `🗑️ Registro de **${criatura}** eliminado correctamente.`
        });
    }
};
