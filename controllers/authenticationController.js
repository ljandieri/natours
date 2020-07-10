const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE_IN });

const createSendToken = (user, statusCode, res, req) => {
   const token = signToken(user._id);
   res.cookie('jwt', token, {
      expires: new Date(Date.now()
         + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: (req.secure || req.headers['x-forwarded-proto'] === 'https'),
   });

   user.password = undefined;

   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user,
      },
   });
};

exports.signup = catchAsync(async (req, res, next) => {
   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
   });
   const url = `${req.protocol}://${req.get('host')}/me`;
   await new Email(newUser, url).sendWelcome();
   createSendToken(newUser, 201, res, req);
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;
   // 1) check if email and password exists
   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
   }
   // 2) check if email exists
   const user = await User.findOne({ email }).select('+password');

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
   }
   // 3) if everything is ok, send the json token back to client
   createSendToken(user, 200, res, req);
});

exports.logout = (req, res) => {
   res.cookie('jwt', 'loggedOut', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
   });
   res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
   // 1) Get the token and check if it's there.
   let token;
   if (req.headers.authorization
      && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
   } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
   }

   if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.'), 401);
   }
   // 2) verify the token
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
   //console.log(decoded);
   // 3) check if user still exists
   const freshUser = await User.findById(decoded.id);
   if (!freshUser) {
      return next(new AppError('The user no longer exists', 401));
   }
   // 4) check if user changed password after the token was issued.
   if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed the password. Please log in again', 401));
   }

   // grant access to protected route
   res.locals.user = freshUser;
   req.user = freshUser;
   next();
});

// only for rendered pages, no errors!
exports.isLogged = async (req, res, next) => {
   if (req.cookies.jwt) {
      try {
         // verify token
         const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

         // 3) check if user still exists
         const freshUser = await User.findById(decoded.id);
         if (!freshUser) {
            return next();
         }
         // 4) check if user changed password after the token was issued.
         if (freshUser.changedPasswordAfter(decoded.iat)) {
            return next();
         }

         // there is a logged in user
         res.locals.user = freshUser;
         return next();
      } catch (err) {
         return next();
      }
   }
   next();
};

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return next(new AppError('You do not have the permission to perform this action.', 403));
      }
      next();
   };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
   const user = await User.findOne({ email: req.body.email });
   if (!user) {
      return next(new AppError('There is no user with that email address.', 40));
   }
   const resetToken = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false });

   try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
         status: 'success',
         message: 'Token sent to email',
      });
   } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError(err, 500));
   }

   next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
   // get user based on the token
   const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   });
   // set the new password if token is not expired and there is a user
   if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
   }
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();
   // update changedPasswordAt property for the current user
   createSendToken(user, 200, res, req);

   // log the user in, send JWT
});

exports.updatePassword = catchAsync(async (req, res, next) => {
   // get the user from the collection
   const user = await User.findById(req.user.id).select('+password');
   // check if posted password is correct
   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
   }
   // if so, update the password
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save();
   // log the user in, send JWT
   createSendToken(user, 200, res, req);
});
