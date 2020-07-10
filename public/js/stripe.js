//import Stripe from 'stripe';
const catchAsync = require('../../utils/catchAsync');
import axios from 'axios';
import { showAlert } from './alerts';
export const bookTour = catchAsync(async tourId => {
   const stripe = Stripe('pk_test_51H2J3GLvWhH6xCZKb8XFMTDeufvCULi8qa5gURARMB7Jd7ukWLAvbawh8BQOwjiwhAFH1K0rHBEVUzA4VTkwzcZ1007LFLxA97');
   // get checkout session from APi
   try {
      const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id,
      });
   } catch (err) {
      showAlert('error', err);
      console.log(err);
   }
   // create checkout form + charge credit card
});
