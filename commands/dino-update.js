const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');
const { buildDinoEmbed } = require('../embed');
const { LISTA_COMPLETA } = require('../dinos-lista');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino-update')
    .setDescription('Actualiza las estadísticas de una línea mutada')
    .addStringOption(o => o.setName('linea').setDescription('Selecciona la línea a modificar').setRequired(true).setAutocomplete(true))
    .addIntegerOption(o => o.setName('hp').setDescription('Nueva stat de HP').setRequired(false).setMinValue(0))
    .addIntegerOption(o => o.setName('melee').setDescription('Nuevo porcentaje de Melee').setRequired(false).setMinValue(0))
    .addIntegerOption(o => o.setName('stamina').setDescription('Nueva Stamina').setRequired(false).setMinValue(0))
    .addIntegerOption(o => o.setName('peso').setDescription('Nuevo Peso').setRequired(false).setMinValue(0)),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const filtrados = LISTA_COMPLETA.filter(dino => dino.toLowerCase().includes(focusedValue));
    await interaction.respond(filtrados.slice(0, 25).map(dino => ({ name: dino, value: dino })));
  },

  async execute(interaction) {
    const nombreLinea = interaction.options.getString('linea');
    const guildId = interaction.guildId;

    const dino = db.getDino(nombreLinea, guildId);
    if (!dino) {
      return interaction.reply({ content: `❌ No existe ningún registro de **${nombreLinea}** en este servidor.`, ephemeral: true });
    }

    const campos = {};
    const hp      = interaction.options.getInteger('hp');
    const melee   = interaction.options.getInteger('melee');
    const stamina = interaction.options.getInteger('stamina');
    const peso    = interaction.options.getInteger('peso');

    if (hp      !== null) campos.hp      = hp;
    if (melee   !== null) campos.melee   = melee;
    if (stamina !== null) campos.stamina = stamina;
    if (peso    !== null) campos.peso    = peso;

    if (Object.keys(campos).length === 0) {
      return interaction.reply({ content: '⚠️ Debes rellenar al menos una estadística para actualizar.', ephemeral: true });
    }

    db.updateDino(nombreLinea, guildId, campos);
    const updated = db.getDino(nombreLinea, guildId);

    await interaction.reply({ content: `⚡ Stats de **${nombreLinea}** actualizadas correctamente.`, embeds: [buildDinoEmbed(updated)] });
  }
};
