const { EmbedBuilder } = require('discord.js');
const { IMAGENES } = require('./dinos-lista');

function barra(valor, maximo, largo = 12) {
  if (maximo <= 0) maximo = 1;
  const llenos = Math.min(largo, Math.round((valor / maximo) * largo));
  return '█'.repeat(llenos) + '░'.repeat(Math.max(0, largo - llenos));
}

function buildDinoEmbed(dino) {
  const embed = new EmbedBuilder()
    .setColor(0x2f3136) 
    .setTitle(`📊 Ficha de Crianza: ${dino.nombre}`)
    .addFields(
      { name: '❤️ HP', value: `\`${barra(dino.hp, 140000)}\` ${dino.hp.toLocaleString()}`, inline: false },
      { name: '💥 Daño', value: `\`${barra(dino.melee, 2500)}\` ${dino.melee}%`, inline: false }
    );

  if (dino.stamina > 0) {
    embed.addFields({ name: '⚡️ Stamina', value: `\`${barra(dino.stamina, 6000)}\` ${dino.stamina.toLocaleString()}`, inline: true });
  }
  if (dino.peso > 0) {
    embed.addFields({ name: '⚖️ Peso', value: `\`${dino.peso.toLocaleString()}\``, inline: true });
  }

  embed.setFooter({ text: `Acceso Privado de Tribu · ID Interna: ${dino.id}` });

  // Asignación automática desde tu archivo dinos-lista.js
  const imagenBackend = IMAGENES[dino.nombre];
  if (imagenBackend) {
    embed.setImage(imagenBackend);
  }

  return embed;
}

module.exports = { buildDinoEmbed };
