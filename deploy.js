const { REST, Routes, Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const token = process.env.TOKEN;

if (!token) {
    console.error("❌ Error: No se encuentra la variable TOKEN en el archivo .env");
    process.exit(1);
}

// 1. Cargamos los comandos de la carpeta /commands de forma segura
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        // Usamos un try/catch para evitar cargas fantasmas de otros archivos
        try {
            const command = require(filePath);
            if (command && command.data) {
                commands.push(command.data.toJSON());
            }
        } catch (e) {
            // Ignoramos si algún archivo no es un comando válido
        }
    }
}

// 2. Iniciamos un cliente temporal ultra-rápido solo para obtener el ID real del bot en Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    const clientId = client.user.id;
    console.log(`🤖 Bot identificado correctamente con ID: ${clientId}`);
    console.log(`🔄 Registrando ${commands.length} comandos limpios en la API de Discord...`);

    const rest = new REST().setToken(token);

    try {
        // Machaca por completo los comandos viejos de Discord e inyecta los nuevos
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
        console.log('✅ ¡Comandos globales actualizados en Discord con éxito!');
    } catch (error) {
        console.error('❌ Error crítico enviando comandos a Discord:', error);
    } finally {
        client.destroy(); // Apaga el cliente temporal
        process.exit(0);
    }
});

// Conectamos el mini-cliente un segundo para que Discord nos dé su ID oficial
client.login(token).catch(err => {
    console.error("❌ Error al conectar con el Token proporcionado:", err.message);
    process.exit(1);
});
