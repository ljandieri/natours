const express = require('express');
const userController = require('../controllers/userController');
const authenticationController = require('../controllers/authenticationController');
const Router = express.Router();

Router
   .post('/signup',
   authenticationController.signup);
Router
   .post('/login',
   authenticationController.login);
Router
   .get('/logout',
   authenticationController.logout);
Router
   .post('/forgotPassword',
   authenticationController.forgotPassword);
Router
   .patch('/resetPassword/:token',
   authenticationController.resetPassword);
Router
    .use(authenticationController.protect);
Router
    .get('/me',
        userController.getMe,
        userController.getUser);
Router
    .patch('/updateMyPassword',
        authenticationController.updatePassword);
Router
   .patch('/updateMe',
      userController.uploadPhoto,
      userController.resizeUserPhoto,
      userController.updateMe);
Router
    .delete('/deleteMe',
       userController.deleteMe);
Router
   .use(authenticationController.restrictTo('admin'));
Router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
Router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = Router;
