const express = require('express');
const Router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authenticationController = require('../controllers/authenticationController');

Router
   .use(authenticationController.protect);
Router
   .route('/')
   .get(reviewController.getAllReviews)
   .post(authenticationController.restrictTo('user'),
      reviewController.setTourUserIds,
      reviewController.createReview);
Router
   .route('/:id')
   .get(reviewController.getReview)
   .delete(authenticationController.restrictTo('user', 'admin'),
      reviewController.deleteReview)
   .patch(authenticationController.restrictTo('user', 'admin'),
      reviewController.updateReview);
module.exports = Router;
