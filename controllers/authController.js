const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError  = require('../errors');

const {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    createTokenUser,
} = require('../utils');


const register = async (req,res) => {
    const { email,name,password } = req.body;
    
    const emailAlreadyExists = (await User.findOne({ email }));

    if(emailAlreadyExists) {
        throw new CustomError.BadRequestError('email aready exists, please try another email address')
    }

    const user = await User.create({email,name,password});
    const tokenUser = createTokenUser(user);

    attachCookiesToResponse({res, user:tokenUser})
    
    res.status(StatusCodes.CREATED).json({ user:tokenUser }); 
};

const login = async (req,res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        throw new CustomError.BadRequestError('please provide email and password');
    }

    const user = await User.findOne({email});
    if(!user) {
        throw new CustomError.NotFoundError(`No user with the Email provided`)
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user:tokenUser});

    const token = createJWT({ payload: tokenUser }); // Create the JWT token

    res.status(StatusCodes.OK).json({ user:tokenUser, token});
};

const logout = async (req,res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({msg: 'user logged out'});
};

module.exports = { register, login, logout };