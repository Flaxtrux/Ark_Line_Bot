const { SlashCommandBuilder } = require('discord.js');
const db = require('../db.js');

// Lista oficial completa de criaturas de ARK (Extraída de tu archivo local de dinos)
const listaDinosARK = [
    "Allosaurus", "Apatosaurus", "Ankylosaurus", "Archelon", "Arthropluera",
    "Baryonyx", "Basilosaurus", "Brontosaurus", "Carcharodontosaurus",
    "Carnotaurus", "Castoroides", "Ceratosaurus", "Chalicotherium", "Daeodon",
    "Deinocheirus", "Dilophosaurus", "Dimorphodon", "Diplodocus", "Doedicurus",
    "Dunkleosteus", "Electrophorus", "Fascinolasuchus", "Giganotosaurus",
    "Gorgonopsid", "Hesperornis", "Ichthyornis", "Ichthyosaurus", "Iguanodon",
    "Kairuku", "Kaprosuchus", "Kentro", "Liopleurodon", "Lymantria",
    "Mammoth", "Manta", "Megachelon", "Megalania", "Megaloceros", "Megalodon",
    "Megatherium", "Micro raptor", "Mosasaurus", "Onychonycteris", "Ouranosaurus",
    "Oviraptor", "Pachy", "Pachyrhinosaurus", "Paraceratherium", "Parasaur",
    "Pegomastax", "Pelagornis", "Phiomia", "Phoenix", "Placerias", "Plesiosaur",
    "Procoptodon", "Pteranodon", "Pulmonoscorpius", "Purlovia", "Pyroraptor",
    "Quetzal", "Raptor", "Rex", "Rhyniognatha", "Sabertooth", "Sarco",
    "Shastasaurus", "Snow Owl", "Spino", "Stegosaurus", "Tapejara",
    "Terror Bird", "Therizinosaurus", "Thylacoleo", "Titanoboa", "Titanosaur",
    "Triceratops", "Tropeognathus", "Tusoteuthis", "Velonasaur", "Wyvern",
    "Xiphactinus", "Yutyrannus", "Yi Ling"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dino-add')
        .setDescription('Añade o actualiza una línea de dinosaurio usando puntos de nivel')
        .addStringOption(option =>
            option.setName('criatura')
                .setDescription('Selecciona la criatura oficial de ARK')
                .setRequired(true)
                .setAutocomplete(true)) // Enlazado con la función autocomplete() de abajo
        .addIntegerOption(option => option.setName('hp').setDescription('Puntos en Vida - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('stamina').setDescription('Puntos en Energía - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('melee').setDescription('Puntos en Daño - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('peso').setDescription('Puntos en Peso - Opcional').setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        
        // Filtra los dinos de la lista que contienen las letras que escribe el usuario
        const filtered = listaDinosARK.filter(dino => 
            dino.toLowerCase().includes(focusedValue)
        );
        
        // Discord rompe si mandas más de 25 opciones, limitamos con slice
        await interaction.respond(
            filtered.slice(0, 25).map(dino => ({ name: dino, value: dino }))
        );
    },

    async execute(interaction) {
        const criatura = interaction.options.getString('criatura');
        const hp = interaction.options.getInteger('hp') ?? null;
        const stamina = interaction.options.getInteger('stamina') ?? null;
        const melee = interaction.options.getInteger('melee') ?? null;
        const peso = interaction.options.getInteger('peso') ?? null;

        try {
            // Guardar o actualizar si ya existe la criatura (ON CONFLICT)
            const stmt = db.prepare(`
                INSERT INTO dinos (criatura, hp, stamina, melee, peso) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(criatura) DO UPDATE SET
                    hp = COALESCE(excluded.hp, hp),
                    stamina = COALESCE(excluded.stamina, stamina),
                    melee = COALESCE(excluded.melee, melee),
                    peso = COALESCE(excluded.peso, peso)
            `);
            
            stmt.run(criatura, hp, stamina, melee, peso);

            const formatearStat = (val) => val !== null ? `**${val}** pts` : '*No asignado*';

            await interaction.reply({
                content: `✅ **Línea de [${criatura}] guardada/actualizada con éxito:**\n• ❤️ **HP:** ${formatearStat(hp)}\n• ⚡ **Stamina:** ${formatearStat(stamina)}\n• ⚔️ **Melee:** ${formatearStat(melee)}\n• 📦 **Peso:** ${formatearStat(peso)}`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Hubo un error al guardar los datos en la base de datos.', ephemeral: true });
        }
    },
};
