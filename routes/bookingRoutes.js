const express = require('express');
const Router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticationController = require('../controllers/authenticationController');
Router.get('/checkout-session/:tourId',
   authenticationController.protect,
   bookingController.getCheckoutSession);

Router.use(authenticationController.protect);
Router.use(authenticationController.restrictTo('admin', 'lead-guide'));
Router.route('/')
   .get(bookingController.getAllBookings)
   .post(bookingController.createBooking);

Router.route('/:id')
   .get(bookingController.getBooking)
   .patch(bookingController.updateBooking)
   .delete(bookingController.deleteBooking);
Router.use(authenticationController.protect);
module.exports = Router;
