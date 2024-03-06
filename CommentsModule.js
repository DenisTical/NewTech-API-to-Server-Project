const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentsSchema = new Schema({
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    shiftId: {
        type: mongoose.Schema.ObjectId,
        ref: 'shifts'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'users'
    }
});

module.exports = mongoose.model('comments', CommentsSchema);