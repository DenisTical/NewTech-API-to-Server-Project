const express = require('express');
const userController = require('../Controller/UserController');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.patch('/updateUser', userController.protect, userController.updateUserInfo);
router.patch('/updatePassword', userController.protect, userController.updatePassword);
router.post('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

//Admin
router.get('/getAllUsers', userController.protect, userController.permission, userController.getAllUsers);
router.get('/getUserById/:id', userController.getUserById);
router.delete('/deleteUserById/:id', userController.protect, userController.permission, userController.deleteUserById);

module.exports = router;