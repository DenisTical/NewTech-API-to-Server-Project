const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { userInfo } = require('os');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email!"],
    },
    password: {
        type: String,
        required: [true, "Please enter a password!"],
        minlength: [8, "Minimum 8 characters are required!"],
    },
    firstname: {
        type: String,
        required: [true, "Please enter your first name!"],
        trim: true,
    },
    lastname: {
        type: String,
        required: [true, "Please enter your last name!"],
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
});

UserSchema.pre('save', async function(next){
    let user = this;
    if(!user.isModified('password')){
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.virtual('shiftsList', {
    ref: 'shifts',
    foreignField: 'userId',
    localField: "_id"
});

UserSchema.virtual('commentsList', {
    ref: 'comments',
    foreignField: 'userId',
    localField: '_id'
});

UserSchema.methods.comparePassword = async function(passwordBody, passwordDB){
    return await bcrypt.compare(passwordBody, passwordDB);
}

UserSchema.methods.isPasswordChanged = async function(jwtInitialTimeStamp){
    if(this.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt / 1000);
        return jwtInitialTimeStamp < passwordChangedTimestamp;
    }

    return false;
}

UserSchema.methods.createNewPasswordToken = async function(){
    this.passwordResetToken = crypto.randomBytes(30).toString('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    return this.passwordResetToken;
}

module.exports = mongoose.model('users', UserSchema);