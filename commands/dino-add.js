const { SlashCommandBuilder } = require('discord.js');
const db = require('../db.js');

// Lista fija de criaturas de ARK para el autocompletado rápido
const criaturasARK = ['Rex', 'Giganotosaurus', 'Carcharodontosaurus', 'Therizinosaurus', 'Wyvern', 'Arthropluera', 'Ankylosaurus'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-add')
        .setDescription('Añade una nueva línea de dino usando puntos de nivel')
        .addStringOption(option =>
            option.setName('linea')
                .setDescription('Nombre o dueño de la línea (Ej: Rex_Mutado_Top)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('criatura')
                .setDescription('Selecciona o escribe la criatura')
                .setRequired(true)
                .setAutocomplete(true)) // Activamos el autocompletado aquí
        .addIntegerOption(option =>
            option.setName('hp')
                .setDescription('Puntos asignados a Vida (Ej: 45) - Opcional')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('melee')
                .setDescription('Puntos asignados a Daño (Ej: 52) - Opcional')
                .setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        // Filtramos las criaturas que coincidan con lo que escribe el usuario
        const filtered = criaturasARK.filter(choice => choice.toLowerCase().includes(focusedValue));
        
        // Respondemos a Discord antes de que expire el tiempo de carga (máx 25 opciones)
        await interaction.respond(
            filtered.slice(0, 25).map(choice => ({ name: choice, value: choice }))
        );
    },

    async execute(interaction) {
        const linea = interaction.options.getString('linea');
        const criatura = interaction.options.getString('criatura');
        
        // Si el usuario no los pone, el valor por defecto será NULL o "No asignado"
        const hp = interaction.options.getInteger('hp') ?? 'N/A';
        const melee = interaction.options.getInteger('melee') ?? 'N/A';

        // Guardamos los puntos de nivel en la base de datos
        const stmt = db.prepare('INSERT INTO dinos (linea, criatura, hp, melee) VALUES (?, ?, ?, ?)');
        stmt.run(linea, criatura, hp === 'N/A' ? null : hp, melee === 'N/A' ? null : melee);

        await interaction.reply(`✅ **Línea registrada con éxito:**\n• **Criatura:** ${criatura}\n• **Identificador:** ${linea}\n• **Puntos HP:** ${hp}\n• **Puntos Melee:** ${melee}`);
    },
};
