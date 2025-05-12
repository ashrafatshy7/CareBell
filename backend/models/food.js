const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    barcode:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    ingredients:{
        type: [String],
        required: true
    },
    imageURL:{
        type: String,
        required: false,  // Making it optional since existing foods might not have photos
        default: null
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

foodSchema.index({ barcode: 1 });

module.exports = mongoose.model('Foods', foodSchema);