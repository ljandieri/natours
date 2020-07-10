const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
exports.getOverview = catchAsync(async (req, res, next) => {
   // get tour data from collection
   const tours = await Tour.find();
   // build tempate

   // render the template using tour data from 1
   res.status(200).render('overview', {
      title: 'All tours',
      tours,
   });
});

exports.getTour = catchAsync(async (req, res, next) => {
   // get data (include reviews and tour guides)
   let query = Tour.findOne(req.params);
   query = query.populate({ path: 'reviews' });
   const tour = await query;
   if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
   }
   // build template

   // render template
   res.status(200).render('tour', {
      title: `${tour.name} tour`,
      tour, // placeholder
   });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
   // find all bookings
   const bookings = await Booking.find({ user: req.user.id });
   // find tours with the returned IDs
   const tourIDs = bookings.map(el => el.tour);
   const tours = await Tour.find({ _id: { $in: tourIDs } });

   res.status(200).render('overview', {
      title: 'My tours',
         tours,
   });
});

exports.showLogin = catchAsync(async (req, res, next) => {
   res.status(200).render('login', {
      title: 'Log into your account',
   });
});

// exports.sendLoginRequest = catchAsync(async (req, res, next) => {
//    console.log(req);
// });

exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: 'Your account',
   });
};

// exports.updateUserData = catchAsync(async (req, res, next) => {
//    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//       name: req.body.name,
//       email: req.body.email,
//    },
//       {
//          new: true,
//          runValidators: true,
//       });
//    res.status(200).render('account', {
//       title: 'Your account',
//       user: updatedUser,
//    });
// });
