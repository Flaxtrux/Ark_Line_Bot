const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');
const { LISTA_COMPLETA } = require('../dinos-lista');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino-delete')
    .setDescription('Elimina permanentemente una línea del registro')
    .addStringOption(o => o.setName('linea').setDescription('Selecciona la línea a borrar').setRequired(true).setAutocomplete(true)),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const filtrados = LISTA_COMPLETA.filter(dino => dino.toLowerCase().includes(focusedValue));
    await interaction.respond(filtrados.slice(0, 25).map(dino => ({ name: dino, value: dino })));
  },

  async execute(interaction) {
    const nombreLinea = interaction.options.getString('linea');
    const result = db.deleteDino(nombreLinea, interaction.guildId);

    if (result.changes === 0) {
      return interaction.reply({ content: `❌ No se pudo borrar porque no existe la línea **${nombreLinea}**.`, ephemeral: true });
    }

    await interaction.reply({ content: `🗑️ Registro de **${nombreLinea}** eliminado del servidor de la tribu.` });
  }
};
