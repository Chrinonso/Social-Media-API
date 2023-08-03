const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication')

const {
    createPost,
    getAllPosts,
    getAllUserPosts,
    getSinglePost,
    updatePost,
    deletePost,
    likePost,
    timelinePosts,
} = require('../controllers/postController');

router.route('/').get(authenticateUser,getAllPosts).post(authenticateUser,createPost);
router.route('/likePost/:id').put(authenticateUser,likePost);
router.route('/getAllUserPost').get(authenticateUser,getAllUserPosts);
router.route('/timelinePosts').get(authenticateUser,timelinePosts);

router.route('/:id').get(authenticateUser,getSinglePost).patch(authenticateUser,updatePost).delete(authenticateUser,deletePost);

module.exports = router;