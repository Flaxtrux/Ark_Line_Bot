const { SlashCommandBuilder } = require('discord.js');
const { getDino, updateDino, listDinos } = require('../db');
const { buildDinoEmbed } = require('../embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-update')
        .setDescription('Actualiza las estadísticas de una línea existente')
        .addStringOption(o =>
            o.setName('criatura').setDescription('Criatura a modificar').setRequired(true).setAutocomplete(true))
        .addIntegerOption(o => o.setName('hp').setDescription('Nueva stat de HP').setRequired(false).setMinValue(0).setMaxValue(100000))
        .addIntegerOption(o => o.setName('stamina').setDescription('Nueva Stamina').setRequired(false).setMinValue(0).setMaxValue(100000))
        .addIntegerOption(o => o.setName('melee').setDescription('Nuevo Melee').setRequired(false).setMinValue(0).setMaxValue(100000))
        .addIntegerOption(o => o.setName('peso').setDescription('Nuevo Peso').setRequired(false).setMinValue(0).setMaxValue(100000)),

    async autocomplete(interaction) {
        try {
            const input = (interaction.options.getFocused() ?? '').toLowerCase();
            const todos = listDinos(interaction.guildId);
            const filtrados = todos.filter(d => d.criatura.toLowerCase().includes(input)).slice(0, 25);
            await interaction.respond(filtrados.map(d => ({ name: d.criatura, value: d.criatura })));
        } catch {
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const guildId  = interaction.guildId;
        const criatura = interaction.options.getString('criatura');

        const dino = getDino(guildId, criatura);
        if (!dino) return interaction.reply({ content: `❌ No existe **${criatura}**. Usa \`/dino-add\` primero.`, ephemeral: true });

        const campos = {};
        const hp      = interaction.options.getInteger('hp');
        const stamina = interaction.options.getInteger('stamina');
        const melee   = interaction.options.getInteger('melee');
        const peso    = interaction.options.getInteger('peso');

        if (hp      !== null) campos.hp      = hp;
        if (stamina !== null) campos.stamina = stamina;
        if (melee   !== null) campos.melee   = melee;
        if (peso    !== null) campos.peso    = peso;

        if (Object.keys(campos).length === 0) return interaction.reply({ content: '⚠️ Rellena al menos una estadística.', ephemeral: true });

        try {
            updateDino(guildId, criatura, campos);
            const actualizado = getDino(guildId, criatura);
            await interaction.reply({ content: `⚡ Stats de **${criatura}** actualizadas.`, embeds: [buildDinoEmbed(actualizado)] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al actualizar los datos.', ephemeral: true });
        }
    }
};
