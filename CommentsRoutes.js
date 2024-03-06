const express = require('express');
const router = express.Router();
const commentController = require('../Controller/CommentsController');
const userController = require('../Controller/UserController');

router.post('/createComment', userController.protect, commentController.createComment);
router.get('/getCommentById/:id', userController.protect, commentController.getCommentById);
router.patch('/updateCommentById/:id', userController.protect, commentController.updateCommentById);
router.get('/getAllCommentsCreatedByUser/:userId', userController.protect, commentController.getAllCommentsCreatedByUser);

//Admin
router.get('/getAllCommentsFromAllUsers', userController.protect, userController.permission, commentController.getAllCommentsFromAllUsers);
router.delete('/deleteCommentById/:id', userController.protect, userController.permission, commentController.deleteCommentById);

module.exports = router;