const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Cargador de comandos dinámico (Busca en la carpeta /commands)
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Evento de arranque
client.once('ready', (c) => {
    console.log(`Bot conectado como ${c.user.tag}`);
    console.log('Registrando slash commands...');
    // Aquí tu lógica automática o script externo registra los comandos en Discord
    console.log('Slash commands registrados correctamente.');
});

// CONTROLADOR DE INTERACCIONES CENTRAL (Aquí se gestiona el autocompletado)
client.on('interactionCreate', async interaction => {
    
    // 1. Petición de autocompletado (Mientras el usuario escribe en el campo)
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('Error procesando autocompletado:', error);
        }
        return; // Detiene la ejecución aquí ya que solo era una sugerencia de texto
    }

    // 2. Ejecución del comando completo (Cuando el usuario pulsa ENTER)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error ejecutando comando:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.TOKEN);
