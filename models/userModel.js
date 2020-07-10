const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// name, email, photo (string), password, passwordconfirm
const userSchema = mongoose.Schema({
   name: {
      type: String,
      required: [true, 'A user must have a name.'],
      trim: true,
      maxlength: [40, 'Name can not be more than 40 characters.'],
      minlength: [3, 'Name can not be less than 3 characters.'],
   },
   email: {
      type: String,
      required: [true, 'A user must have an e-mail address.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'E-mail address is invalid.'],
   },
   photo: {
      type: String,
      default: 'default.jpg',
   },
   role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
   },
   password: {
      type: String,
      required: [true, 'A user must have a password.'],
      minlength: [8, 'Password cannot be less than 8 characters long.'],
      select: false,
   },
   passwordConfirm: {
      type: String,
      required: [true, 'A user must have a password.'],
      minlength: [8, 'Password cannot be less than 8 characters long.'],
      validate: {
         // This only works on CREATE and SAVE!!!
         validator: function (el) {
            return el === this.password;
         },
         message: 'Passwords are not the same.',
      },
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
   active: {
      type: Boolean,
      default: true,
      select: false,
   },
});

userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next();
   this.passwordChangedAt = Date.now() - 1000;
   next();
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hash(this.password, 12);
   this.passwordConfirm = undefined;
   next();
});

userSchema.pre(/^find/, function (next) {
   // this points to current query
   this.find({ active: { $ne: false } });
   next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
   return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
   if (this.changedPasswordAt) {
      const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
      return JWTTimeStamp < changedTimeStamp;
   }

   return false;
};

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');
   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
