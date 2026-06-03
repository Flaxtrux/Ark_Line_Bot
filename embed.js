const { EmbedBuilder } = require('discord.js');
const { IMAGENES } = require('./dinos-lista');

function buildDinoEmbed(dino) {
  const embed = new EmbedBuilder()
    .setColor(0x2f3136) 
    .setTitle(`📊 Ficha de Crianza: ${dino.nombre}`)
    .addFields(
      { name: '❤️ HP', value: `\`${dino.hp.toLocaleString()}\``, inline: false },
      { name: '💥 Daño', value: `\`${dino.melee.toLocaleString()}%\``, inline: false }
    );

  if (dino.stamina > 0) {
    embed.addFields({ name: '⚡️ Stamina', value: `\`${dino.stamina.toLocaleString()}\``, inline: true });
  }
  if (dino.peso > 0) {
    embed.addFields({ name: '⚖️ Peso', value: `\`${dino.peso.toLocaleString()}\``, inline: true });
  }

  embed.setFooter({ text: `Acceso Privado de Tribu · ID Interna: ${dino.id}` });

  // Asignación automática de la foto desde dinos-lista.js
  const imagenBackend = IMAGENES[dino.nombre];
  if (imagenBackend) {
    embed.setImage(imagenBackend);
  }

  return embed;
}

module.exports = { buildDinoEmbed };
