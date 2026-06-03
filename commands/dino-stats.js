const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');
const { buildDinoEmbed } = require('../embed');
const { LISTA_COMPLETA } = require('../dinos-lista');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino-stats')
    .setDescription('Muestra la ficha técnica de una línea de crianza')
    .addStringOption(o => o.setName('linea').setDescription('Selecciona la línea a consultar').setRequired(true).setAutocomplete(true)),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const filtrados = LISTA_COMPLETA.filter(dino => dino.toLowerCase().includes(focusedValue));
    await interaction.respond(filtrados.slice(0, 25).map(dino => ({ name: dino, value: dino })));
  },

  async execute(interaction) {
    const nombreLinea = interaction.options.getString('linea');
    const dino = db.getDino(nombreLinea, interaction.guildId);

    if (!dino) {
      return interaction.reply({ content: `❌ No se encontraron datos para **${nombreLinea}** en esta tribu.`, ephemeral: true });
    }

    await interaction.reply({ embeds: [buildDinoEmbed(dino)] });
  }
};
