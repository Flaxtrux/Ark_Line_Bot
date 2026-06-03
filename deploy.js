const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🔄 Actualizando ${commands.length} comandos en la API de Discord...`);
        
        // Obtenemos el ID del bot decodificando el Token de forma segura
        const clientId = Buffer.from(process.env.TOKEN.split('.')[0], 'base64').toString('ascii');

        // Esto limpia la caché de Discord de manera global e inyecta el comando nuevo
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ ¡Comandos globales actualizados en Discord con éxito!');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
})();
