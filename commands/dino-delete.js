const { SlashCommandBuilder } = require('discord.js');
const { getDino, deleteDino, listDinos } = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-delete')
        .setDescription('Elimina permanentemente una línea del registro')
        .addStringOption(o =>
            o.setName('criatura').setDescription('Selecciona la criatura a borrar').setRequired(true).setAutocomplete(true)),

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
        await interaction.deferReply();
        const criatura = interaction.options.getString('criatura');
        const dino = getDino(interaction.guildId, criatura);

        if (!dino) {
            return interaction.editReply({ content: `❌ No existe **${criatura}** en este servidor.` });
        }

        deleteDino(interaction.guildId, criatura);
        await interaction.editReply({ content: `🗑️ Registro de **${criatura}** eliminado.` });
    }
};
