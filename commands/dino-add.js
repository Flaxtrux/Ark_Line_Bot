const { SlashCommandBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { buildDinoEmbed } = require('../embed');
const { LISTA_COMPLETA } = require('../dinos-lista');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino-add')
    .setDescription('Registra una nueva línea de crianza de la tribu')
    .addStringOption(o => o.setName('linea').setDescription('Selecciona la criatura').setRequired(true).setAutocomplete(true))
    .addIntegerOption(o => o.setName('hp').setDescription('Puntos de HP puros').setRequired(true).setMinValue(0))
    .addIntegerOption(o => o.setName('melee').setDescription('Porcentaje de Melee/Daño (Ej: 1255)').setRequired(true).setMinValue(0))
    .addIntegerOption(o => o.setName('stamina').setDescription('Puntos de Stamina').setRequired(false).setMinValue(0))
    .addIntegerOption(o => o.setName('peso').setDescription('Puntos de Peso').setRequired(false).setMinValue(0)),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const filtrados = LISTA_COMPLETA.filter(dino => dino.toLowerCase().includes(focusedValue));
    await interaction.respond(filtrados.slice(0, 25).map(dino => ({ name: dino, value: dino })));
  },

  async execute(interaction) {
    const nombreLinea = interaction.options.getString('linea');
    const guildId = interaction.guildId;

    if (!LISTA_COMPLETA.includes(nombreLinea)) {
      return interaction.reply({ content: '❌ Por favor, selecciona un dinosaurio válido usando el buscador predictivo.', ephemeral: true });
    }

    if (db.getDino(nombreLinea, guildId)) {
      return interaction.reply({ content: `❌ La línea de **${nombreLinea}** ya está registrada. Usa \`/dino-update\` si ha mutado.`, ephemeral: true });
    }

    const dino = {
      id: uuidv4().slice(0, 8),
      nombre:     nombreLinea,
      especie:    nombreLinea,
      nivel:      1, 
      imagen_url: null,
      hp:         interaction.options.getInteger('hp'),
      melee:      interaction.options.getInteger('melee'),
      stamina:    interaction.options.getInteger('stamina') ?? 0,
      peso:       interaction.options.getInteger('peso')    ?? 0,
      oxigeno:    0,
      servidor:   'Interno',
      tribu:      'Tribu',
      guild_id:   guildId
    };

    db.addDino(dino);
    await interaction.reply({ content: `✅ Línea de **${nombreLinea}** registrada con éxito.`, embeds: [buildDinoEmbed(dino)] });
  }
};
