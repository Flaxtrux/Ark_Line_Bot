const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Forzamos la lectura del token
const token = process.env.TOKEN;

if (!token) {
    console.error("❌ Error: No se encuentra la variable TOKEN en el archivo .env");
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`🔄 Preparando actualización de ${commands.length} comandos...`);
        
        // Sacamos el ID de la primera parte del Token de forma manual y robusta
        const clientId = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
        console.log(`🤖 Aplicando cambios para el Bot ID: ${clientId}`);

        // Enviamos la lista limpia a la API de Discord
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ ¡Comandos globales actualizados en Discord con éxito! (La caché tardará unos instantes en limpiar)');
    } catch (error) {
        console.error('❌ Error crítico al registrar comandos:', error);
    }
})();
