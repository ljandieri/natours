const stripe = require('stripe')(''); // renived key
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
   // get currently booked tour
   const tour = await Tour.findById(req.params.tourId);
   // create the checkout session
   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
         {
            name: `${tour.name}`,
            description: tour.summary,
            images: ['https://www.natours.dev/img/tours/tour-1-cover.jpg'],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1,
         },
      ],
   });
   // send it to client
   res.status(200).json({
      status: 'success',
      session,
   });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
   const { tour, user, price } = req.query;

   if (!tour || !user || !price) return next();
   await Booking.create({ tour, user, price });
   res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
