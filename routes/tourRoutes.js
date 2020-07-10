const express = require('express');
const authenticationController = require('../controllers/authenticationController');
const Router = express.Router();
const tourController = require('../controllers/tourController');
//Router.param('id', tourController.CheckID);
const reviewRouter = require('./reviewRoutes');

Router.use('/:tourId/reviews', reviewRouter);
Router
    .route('/monthly-plan/:year')
    .get(authenticationController.protect,
        authenticationController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);
Router
    .route('/tourStats')
    .get(tourController.getTourStats);
Router
    .route('/top5')
    .get(tourController.aliasTopTours, tourController.getAllTours);
Router
   .route('/:id')
   .get(tourController.getTour)
   .patch(authenticationController.protect,
      authenticationController.restrictTo('admin', 'lead-guide'),
      tourController.uploadTourImages,
      tourController.resizeTourImages,
      tourController.updateTour)
   .delete(
        authenticationController.protect,
        authenticationController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour,
);
Router
    .route('/distances/:latlng/:unit')
    .get(tourController.getDistances);
Router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
Router
    .route('/')
    .get(tourController.getAllTours)
    .post(authenticationController.protect,
        authenticationController.restrictTo('admin', 'lead-guide'),
        tourController.createTour);

// Router
//     .route('/:tourId/reviews')
//     .post(authenticationController.protect,
//         authenticationController.restrictTo('user'),
//         reviewController.createReview);

module.exports = Router;
