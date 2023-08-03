const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { StatusCodes } = require('http-status-codes');
const CustomError  = require('../errors');

const createPost = async (req,res) => {
     const { descr,image } = req.body;
     req.body.user = req.user.userId;
     const post = await Post.create(req.body)

     res.status(StatusCodes.CREATED).json({ post });
};

const getAllPosts = async (req,res) => {
    const post = await Post.find({});

    res.status(StatusCodes.OK).json({ post, count:post.length });
};

const getAllUserPosts = async (req,res) => {
    const userId  = req.user.userId;
    

    const post = await Post.find({user:userId});
    if(!post) {
        throw new CustomError.BadRequestError(`there is no post with ID ${userId}`);

    }
    if(post <= 1) {
        throw new CustomError.BadRequestError('You do not have any post yet, please create post!!')
    }

    res.status(StatusCodes.OK).json({ post, count:post.length });
};

const getSinglePost = async (req,res) => {
    const userId = req.user.userId;
    const { id:postId } = req.params;

    const post = await Post.findOne({ _id:postId, user:userId});

    if(!post) {
        throw new CustomError.NotFoundError(`There is no post with ID ${postId}`);
    }
    res.status(StatusCodes.OK).json({ post, count:post.length });

};

const updatePost = async (req,res) => {
    const { id: postId } = req.params;
    const userId = req.user.userId;
    const { descr, img } = req.body;

    if(!descr || !img) {
        throw new CustomError.BadRequestError('Please provide post description and image');
    };

    const post = await Post.findOneAndUpdate({_id:postId, user:userId}, {descr, img}, {new:true, runvalidators:true});

    if(!post) {
        throw new CustomError.NotFoundError(`There is no post with ID ${postId}`);
    };

    res.status(StatusCodes.OK).json({ post, msg:'post updated!!!'});
};

const deletePost = async (req,res) => {
    const { id:postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findOneAndRemove({_id:postId, user:userId});

    if(!post) {
        throw new CustomError.NotFoundError(`No post with the ID ${postId}`)
    }
    res.status(StatusCodes.OK).json({ msg: 'Post Deleted' });
};

const likePost = async (req,res) => {
    //destructuring the ID coming from the req.params;
    const { id:postId } = req.params;
    const userId = req.user.userId;

    
    const post = await Post.findOne({_id:postId});

    if(!post) {
        throw new CustomError.NotFoundError(`There is no post with ID ${postId}`);
    }
    if(post.likes.includes(userId)) {
        throw new CustomError.BadRequestError('You already liked this post');
    }
    await post.updateOne({$push:{likes:userId}},{runValidators:true});
    
    res.status(StatusCodes.OK).json({ msg: `the post has been liked by ${req.user.name}` });


};

const timelinePosts = async (req,res) => {
    const currentUserID = req.user.userId;

    const user = await Post.find({_id:currentUserID}).populate('following', 'followers');
    if(!user) {
        throw new CustomError.NotFoundError('User not found');
    }
    const friendIds = user.following.map((following) => {following._id})

    const timelinePosts = await Post.find({ user: { $in: friendIds } });

    res.status(StatusCodes.OK).json({ timelinePosts });

};



module.exports = {
    createPost,
    getAllPosts,
    getAllUserPosts,
    getSinglePost,
    updatePost,
    deletePost,
    likePost,
    timelinePosts,
};