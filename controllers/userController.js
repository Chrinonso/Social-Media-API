const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError  = require('../errors');
const { createJWT,
    isTokenValid,
    attachCookiesToResponse,
    createTokenUser } = require('../utils')


const getAllUsers = async (req,res) => {
    const user = await User.find({});
    res.status(StatusCodes.OK).json({user})
};

const getSingleUser = async (req,res) => {
    const { id:userId } = req.params;

    const user = await User.findOne({_id:userId});

    if(!user) {
        throw new CustomError.NotFoundError(`there is no user with ID ${userId}`);
    }

    res.status(StatusCodes.OK).json({ user })
};

const updateUser = async (req,res) => {
    const { name,email,profilePicture } = req.body;
    if(!name || !email || !profilePicture) {
        throw new CustomError.BadRequestError('Please provide correct credentials')
    }

    const user = await User.findOneAndUpdate({_id:req.user.userId}, {name,email,profilePicture}, {new:true, runValidators:true});
    if(!user) {
        throw new CustomError.BadRequestError('Please provide valid credentials');
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user:tokenUser});

    res.status(StatusCodes.OK).json({ user:tokenUser, msg:'Account updated' })
};

const updateUserPassword = async (req,res) => {
    const { oldPassword, newPassword } = req.body;

    if(!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide old and new password');
    }

    const user = await User.findOne({_id:req.user.userId});
    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if(!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    user.password = newPassword;
    await user.save();
    
    res.status(StatusCodes.OK).json({ msg: 'Password Updated!!'})
};

const deleteUser = async (req,res) => {
    const { id:userId } = req.params

    const user = await User.findOneAndRemove({_id:req.user.userId});
    if(!user) {
        throw new CustomError.NotFoundError(`No user with ID ${userId}`)
    }
    res.status(StatusCodes.OK).json({ msg:'User succesfully deleted' });
};


const followUser = async (req,res) => {
    //destructuring the currentuser ID and userToFollow ID
    const currentUser = req.user.userId;
    const { id:userToFollowId } = req.params;

    // searching in the database if the user truly exists
    const userToFollow = await User.findOne({_id:userToFollowId});
    const user = await User.findOne({_id:currentUser});

    // checking if the current user and the user to follow is the same, then throw error
    if( currentUser === userToFollowId) {
        throw new CustomError.BadRequestError('You cannot follow yourself');
    }

    if(!userToFollow) {
        throw new CustomError.BadRequestError('No user found')
    }

    if (userToFollow.followers.includes(currentUser)) {
        throw new CustomError.BadRequestError('You already follow this user')
    }

    // push the ID into the following array and the followers arrat respectively
    // user.following.push(userToFollowId);
    await user.updateOne({$push:{following:userToFollowId}},{runValidators:true});
    await userToFollow.updateOne({$push:{followers:currentUser}},{runValidators:true});

    // userToFollow.followers.push(currentUser);
    res.status(StatusCodes.OK).json({ msg:'User followed Succesfully' });
};






// const followUser = async (req,res) => {
//     const { id:userId } = req.params;
//     const { followerId } = req.body.followerId;

//     const user = await User.findOne({_id:userId});
//     const currentUser = await User.findOne({followerId});

//     if (!user.followers.includes (userId)) {
//         await user.updateOne({$push:{followings:userId}},{runValidators:true});
//     } else {
//         throw new CustomError.BadRequestError('You already follow this user')
//     }
    

//     res.status(StatusCodes.OK).json({msg:'User followed'})
// };

const unfollowUser = async (req,res) => {
    //destructuring the currentuser ID and userToFollow ID
    const currentUser = req.user.userId;
    const { id:userToFollowId } = req.params;

    // searching in the database if the user truly exists
    const userToFollow = await User.findOne({_id:userToFollowId});
    const user = await User.findOne({_id:currentUser});

    // checking if the current user and the user to follow is the same, then throw error
    if( currentUser === userToFollowId) {
        throw new CustomError.BadRequestError('You cannot unfollow yourself');
    }

    if(!userToFollow) {
        throw new CustomError.BadRequestError('No user found')
    }

    if (!userToFollow.followers.includes(currentUser)) {
        throw new CustomError.BadRequestError('You already unfollowed this user')
    }

    // push the ID into the following array and the followers arrat respectively
    // user.following.push(userToFollowId);
    await user.updateOne({$pull:{following:userToFollowId}},{runValidators:true});
    await userToFollow.updateOne({$pull:{followers:currentUser}},{runValidators:true});

    // userToFollow.followers.push(currentUser);
    res.status(StatusCodes.OK).json({ msg:'User unfollowed Succesfully' });
};

module.exports = {
    getAllUsers,
    getSingleUser,
    updateUser,
    updateUserPassword,
    deleteUser,
    followUser,
    unfollowUser,
};