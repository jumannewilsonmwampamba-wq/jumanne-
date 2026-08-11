const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    jinaLaWiki: {
        type: String,
        required: true, // Mfano: "Challenge Week ya 15 - Mwaka 2026"
        trim: true
    },
    wilayaIhusuyo: {
        type: String,
        required: true, // Mfano: "Mbozi" au "Ilala" au "Kitaifa"
        index: true
    },
    kundiLaUmri: {
        type: String,
        enum: ['Chipukizi (18-25)', 'Wakongwe (26+)', 'Wote'],
        default: 'Wote' // Inasoma lile sanduku la hesabu ya umri tulilolisimika fomu ya 3
    },
    kiwangoChaZawadi: {
        type: Number,
        required: true // Mfano: TZS 100,000 taslimu ya zawadi ya wiki
    },
    haliYaShindano: {
        type: String,
        enum: ['Inasubiri', 'Inaendelea', 'Imefungwa'],
        default: 'Inasubiri'
    },
    tareheYaKuanza: {
        type: Date,
        required: true
    },
    tareheYaKumalizika: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
