const { SlashCommandBuilder } = require('discord.js');
const { upsertDino, getDino } = require('../db');
const { crearEmbedDino } = require('../embed');
const { LISTA_COMPLETA } = require('../dinos-lista');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-add')
        .setDescription('Añade o actualiza una línea de dinosaurio usando puntos de nivel')
        .addStringOption(option =>
            option.setName('criatura')
                .setDescription('Selecciona la criatura oficial de ARK')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option => option.setName('hp').setDescription('Puntos en Vida - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('stamina').setDescription('Puntos en Energía - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('melee').setDescription('Puntos en Daño - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('peso').setDescription('Puntos en Peso - Opcional').setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = (interaction.options.getFocused() ?? '').toLowerCase();
        const filtered = LISTA_COMPLETA.filter(dino =>
            dino.toLowerCase().includes(focusedValue)
        );
        await interaction.respond(
            filtered.slice(0, 25).map(dino => ({ name: dino, value: dino }))
        );
    },

    async execute(interaction) {
        const criatura = interaction.options.getString('criatura');
        const hp       = interaction.options.getInteger('hp')      ?? null;
        const stamina  = interaction.options.getInteger('stamina') ?? null;
        const melee    = interaction.options.getInteger('melee')   ?? null;
        const peso     = interaction.options.getInteger('peso')    ?? null;

        try {
            upsertDino(criatura, { hp, stamina, melee, peso });
            const filaActual = getDino(criatura);
            await interaction.reply({
                embeds: [crearEmbedDino(criatura, filaActual)]
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Hubo un error al guardar los datos en la base de datos.',
                ephemeral: true
            });
        }
    },
};
