client.on('interactionCreate', async interaction => {
    // 1. GESTIÓN DEL AUTOCOMPLETADO
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            // Llama a la función 'autocomplete' que pusimos dentro de dino-add.js
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('Error en el autocompletado del comando:', error);
        }
        return; // Terminamos aquí si era una petición de autocompletar
    }

    // 2. GESTIÓN DE EJECUCIÓN DEL COMANDO (Hacer Enter)
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
        }
    }
});
