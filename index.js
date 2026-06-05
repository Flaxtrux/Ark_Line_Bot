require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

const commandsData = [];
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  commandsData.push(command.data.toJSON());
}

// Registrar slash commands en Discord
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Registrando slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commandsData }
    );
    console.log('Slash commands registrados correctamente.');
  } catch (error) {
    console.error('Error registrando comandos:', error);
  }
}

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  await registerCommands();
});

// Expulsar el bot si alguien lo añade a un servidor no autorizado
client.on('guildCreate', guild => {
  const permitidos = process.env.GUILDS_PERMITIDOS?.split(',').map(id => id.trim()) ?? [];
  if (!permitidos.includes(guild.id)) {
    console.log(`Servidor no autorizado: ${guild.name} (${guild.id}) — saliendo`);
    guild.leave();
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const msg = { content: 'Hubo un error ejecutando este comando.', ephemeral: true };
    interaction.replied || interaction.deferred
      ? await interaction.followUp(msg)
      : await interaction.reply(msg);
  }
});

client.login(process.env.DISCORD_TOKEN);
