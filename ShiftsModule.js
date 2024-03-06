const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShiftSchema = new Schema({
    startTime: {
        type: Date,
        required: [true, "Please enter a start time!"]
    },
    endTime: {
        type: Date,
        required: [true, "Please enter an end time!"],
    },
    perHour: {
        type: Number,
        required: [true, "Please enter your price per hour!"]
    },
    place: {
        type: String,
        required: [true, "Please enter your working place!"],
        trim: true,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "users"
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "users"
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

ShiftSchema.virtual('computedPerHour').get(function(){
    const totalTime = (this.endTime - this.startTime) / (1000 * 60 * 60);
    const perHourRate = this.perHour / totalTime;

    return perHourRate;
});

ShiftSchema.virtual('commentsList', {
    ref: "comments",
    foreignField: "shiftId",
    localField: '_id'
});

module.exports = mongoose.model('shifts', ShiftSchema);