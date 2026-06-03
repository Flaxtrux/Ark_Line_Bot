const { SlashCommandBuilder } = require('discord.js');
const { upsertDino, getDino } = require('../db');
const { crearEmbedDino } = require('../embed');

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
                .setAutocomplete(true))
        .addIntegerOption(option => option.setName('hp').setDescription('Puntos en Vida - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('stamina').setDescription('Puntos en Energía - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('melee').setDescription('Puntos en Daño - Opcional').setRequired(false))
        .addIntegerOption(option => option.setName('peso').setDescription('Puntos en Peso - Opcional').setRequired(false)),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const filtered = listaDinosARK.filter(dino =>
            dino.toLowerCase().includes(focusedValue)
        );
        await interaction.respond(
            filtered.slice(0, 25).map(dino => ({ name: dino, value: dino }))
        );
    },

    async execute(interaction) {
        const criatura = interaction.options.getString('criatura');
        const hp       = interaction.options.getInteger('hp')      ?? null;
        const stamina  = interaction.options.getInteger('stamina') ?? null;
        const melee    = interaction.options.getInteger('melee')   ?? null;
        const peso     = interaction.options.getInteger('peso')    ?? null;

        try {
            // Guardar / fusionar con datos previos
            upsertDino(criatura, { hp, stamina, melee, peso });

            // Leer la fila resultante para mostrar el estado COMPLETO (incluye valores previos)
            const filaActual = getDino(criatura);

            // Responder con el Embed visual
            await interaction.reply({
                embeds: [crearEmbedDino(criatura, filaActual)]
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Hubo un error al guardar los datos en la base de datos.',
                ephemeral: true
            });
        }
    },
};
