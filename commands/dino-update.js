const { SlashCommandBuilder } = require('discord.js');
const { getDino, updateDino, listDinos } = require('../db');
const { buildDinoEmbed } = require('../embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-update')
        .setDescription('Actualiza las estadísticas de una línea existente')
        .addStringOption(o =>
            o.setName('criatura')
             .setDescription('Selecciona la criatura a modificar')
             .setRequired(true)
             .setAutocomplete(true))
        .addIntegerOption(o => o.setName('hp').setDescription('Nueva stat de HP').setRequired(false).setMinValue(0))
        .addIntegerOption(o => o.setName('stamina').setDescription('Nueva Stamina').setRequired(false).setMinValue(0))
        .addIntegerOption(o => o.setName('melee').setDescription('Nuevo Melee').setRequired(false).setMinValue(0))
        .addIntegerOption(o => o.setName('peso').setDescription('Nuevo Peso').setRequired(false).setMinValue(0)),

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
                content: `❌ No existe ningún registro de **${criatura}**. Usa \`/dino-add\` para crearlo primero.`,
                ephemeral: true
            });
        }

        const campos = {};
        const hp      = interaction.options.getInteger('hp');
        const stamina = interaction.options.getInteger('stamina');
        const melee   = interaction.options.getInteger('melee');
        const peso    = interaction.options.getInteger('peso');

        if (hp      !== null) campos.hp      = hp;
        if (stamina !== null) campos.stamina = stamina;
        if (melee   !== null) campos.melee   = melee;
        if (peso    !== null) campos.peso    = peso;

        if (Object.keys(campos).length === 0) {
            return interaction.reply({
                content: '⚠️ Debes rellenar al menos una estadística para actualizar.',
                ephemeral: true
            });
        }

        updateDino(criatura, campos);
        const actualizado = getDino(criatura);

        await interaction.reply({
            content: `⚡ Stats de **${criatura}** actualizadas correctamente.`,
            embeds: [buildDinoEmbed(actualizado)]
        });
    }
};
