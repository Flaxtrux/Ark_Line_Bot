const { SlashCommandBuilder } = require('discord.js');
const { upsertDino, getDino } = require('../db');
const { crearEmbedDino } = require('../embed');
const { LISTA_COMPLETA } = require('../dinos-lista');

const CRIATURAS_VALIDAS = new Set(LISTA_COMPLETA);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-add')
        .setDescription('Añade o actualiza una línea de dinosaurio usando puntos de nivel')
        .addStringOption(o =>
            o.setName('criatura').setDescription('Selecciona la criatura oficial de ARK').setRequired(true).setAutocomplete(true))
        .addIntegerOption(o => o.setName('hp').setDescription('Puntos en Vida').setRequired(false).setMinValue(0).setMaxValue(100000))
        .addIntegerOption(o => o.setName('stamina').setDescription('Puntos en Energía').setRequired(false).setMinValue(0).setMaxValue(100000))
        .addIntegerOption(o => o.setName('melee').setDescription('Puntos en Daño').setRequired(false).setMinValue(0).setMaxValue(100000))
        .addIntegerOption(o => o.setName('peso').setDescription('Puntos en Peso').setRequired(false).setMinValue(0).setMaxValue(100000)),

    async autocomplete(interaction) {
        try {
            const input = (interaction.options.getFocused() ?? '').toLowerCase();
            const filtered = LISTA_COMPLETA.filter(d => d.toLowerCase().includes(input));
            await interaction.respond(filtered.slice(0, 25).map(d => ({ name: d, value: d })));
        } catch {
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const guildId  = interaction.guildId;
        const criatura = interaction.options.getString('criatura');

        if (!CRIATURAS_VALIDAS.has(criatura)) {
            return interaction.reply({
                content: `❌ **${criatura}** no es válida. Selecciona una opción de la lista.`,
                ephemeral: true
            });
        }

        const hp      = interaction.options.getInteger('hp')      ?? null;
        const stamina = interaction.options.getInteger('stamina') ?? null;
        const melee   = interaction.options.getInteger('melee')   ?? null;
        const peso    = interaction.options.getInteger('peso')    ?? null;

        try {
            upsertDino(guildId, criatura, { hp, stamina, melee, peso });
            const fila = getDino(guildId, criatura);
            await interaction.reply({ embeds: [crearEmbedDino(criatura, fila)] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al guardar los datos.', ephemeral: true });
        }
    },
};
