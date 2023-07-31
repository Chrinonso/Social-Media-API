const express = require('mongoose');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'please provide your name'],
        maxLength: 30,
    },
    
    email: {
        type:String,
        required:[true, 'please provide email'],
        validate: {
            validator:validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    password:{
        type:String,
        required:[true, "Please provide password"],
        maxLength: 30,
    },
    profilePicture:{
        type:String,
        default:"",
    },
    coverPicture:{
        type:String,
        default:"",
    },
    followers: {
        type:Array,
        default:[],
    },
    followings: {
        type:Array,
        default:[],

    },
    role:{
        type:String,
        enum:['admin', 'user'],
        default: 'user',
    }
    
},{timestamps:true},);

UserSchema.pre('save', async function () {
    if(!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);