const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    barcode:{
        type: String,
        require: true,
    },
    name:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    },
    ingredients:{
        type: [String],
        require: true
    },
});

foodSchema.index({ barcode: 1 });


module.exports = mongoose.model('Foods', foodSchema);