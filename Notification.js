const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    mtumiajiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    kichwaChaHabari: {
        type: String,
        required: true // Mfano: "💰 Zawadi Imetumwa!"
    },
    ujumbeKamili: {
        type: String,
        required: true // Mfano: "Kura zako zimefuzu na TZS 50,000 imerushwa M-Pesa!"
    },
    ainaYaTaarifa: {
        type: String,
        enum: ['Kura', 'Like', 'Malipo', 'Mfumo'],
        default: 'Kura'
    },
    isSoma: {
        type: Boolean,
        default: false // Mtumiaji akifungua App inabadilika kuwa true
    },
    tareheYaKutengenezwa: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
