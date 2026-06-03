const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.TOKEN;

if (!token) {
    console.error("❌ Error crítico: El contenedor no ha recibido la variable TOKEN.");
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);
        if (command && command.data) {
            commands.push(command.data.toJSON());
        }
    } catch (e) {
        // Ignorar archivos que no sean comandos válidos
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        // Extraemos el Client ID de forma dinámica decodificando la primera sección del Token
        const clientId = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
        
        console.log(`🤖 Inicializando registro para el Bot ID detectado automáticamente...`);
        console.log(`🔄 Registrando ${commands.length} comandos limpios en la API de Discord...`);

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ ¡Comandos globales actualizados en Discord con éxito!');
    } catch (error) {
        console.error('❌ Error enviando comandos a Discord:', error);
    }
})();
