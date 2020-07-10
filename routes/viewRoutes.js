const express = require('express');
const viewController = require('../controllers/viewController');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.createBookingCheckout,
   authenticationController.isLogged,
   viewController.getOverview);

router.get('/tours/:slug',
   authenticationController.isLogged,
   viewController.getTour);

router.route('/login')
   .get(authenticationController.isLogged, viewController.showLogin);

router.get('/me', authenticationController.protect, viewController.getAccount);
router.get('/my-tours', authenticationController.protect,
   viewController.getMyTours);
// router.post('/submit-user-data',
//    authenticationController.protect,
//    viewController.updateUserData);
// create /login route

// create controller

//create template
module.exports = router;
