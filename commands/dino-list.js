const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dino-list')
    .setDescription('Muestra un índice con todas las líneas de la tribu'),

  async execute(interaction) {
    const dinos = db.listDinos(interaction.guildId);

    if (dinos.length === 0) {
      return interaction.reply({ content: '📭 La tribu aún no ha registrado ninguna línea de crianza.', ephemeral: true });
    }

    const listaTexto = dinos.map(d => `🦕 **${d.nombre}** — *HP: ${d.hp.toLocaleString()} | Melee: ${d.melee}%*`).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle(`📋 Catálogo de Líneas de la Tribu (${dinos.length})`)
      .setDescription(listaTexto)
      .setFooter({ text: 'Usa /dino-stats para ver la ficha gráfica completa.' });

    await interaction.reply({ embeds: [embed] });
  }
};
