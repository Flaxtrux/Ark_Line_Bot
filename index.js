const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

if (!process.env.TOKEN) {
    console.error('❌ TOKEN no encontrado, revisa el .env');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.warn(`⚠️ ${file} ignorado: falta 'data' o 'execute'`);
            }
        } catch (err) {
            console.error(`❌ Error cargando ${file}:`, err);
        }
    }
}

client.once('clientReady', (c) => {
    console.log(`✅ Bot conectado como ${c.user.tag}`);
    console.log(`📦 ${client.commands.size} comandos cargados.`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.guildId) return; // ignorar DMs

    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command?.autocomplete) return;
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(`Error autocomplete ${interaction.commandName}:`, error);
        }
        return;
    }

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error ejecutando ${interaction.commandName}:`, error);
            try {
                const msg = { content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true };
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply(msg);
                } else {
                    await interaction.followUp(msg);
                }
            } catch { /* si ni responder funciona, ignorar */ }
        }
    }
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Error no controlado:', error);
});

client.login(process.env.TOKEN);
