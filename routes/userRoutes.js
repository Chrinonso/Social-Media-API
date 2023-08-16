const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication') 

const {
    getAllUsers,
    getSingleUser,
    updateUser,
    updateUserPassword,
    deleteUser,
    followUser,
    unfollowUser,
} = require('../controllers/userController');

router.route('/').get(authenticateUser, getAllUsers);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);
router.route('/unfollow/:id').put(authenticateUser,unfollowUser);



router.route('/:id').get(authenticateUser, getSingleUser).delete(authenticateUser,deleteUser).put(authenticateUser,followUser);

module.exports = router;

