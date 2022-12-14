/* eslint-disable prettier/prettier */
const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Please send us your name'],
    },
    email : {
        type : String,
        required : [true,'Please provide your email'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail,'Please provide a valid email']
    },
    photo : String,
    role : {
        type : String,
        enum : ['user','guide','lead-guide','admin'],
        default : 'user'
    },
    password : {
        type : String,
        required : [true,'Please provide your password'],
        minlength : 8,
        select : false
    },
    passwordConfirm : {
        type : String,
        required : [true,'Please confirm your password'],
        validate : {
            //This only works on CREATE and SAVE!!!
            validator : function(el){
                return el === this.password
            },
            message : 'Password are not the same!'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : Boolean,
        default : true,
        select : false // ẩn chi tiết triển khai này
    }
})

userSchema.pre('save',async function(next){
    // Only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //  Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    //Delete passwordConfirm field
    this.passwordConfirm = undefined
    next()
}) // bài 4 phần 10 .Managing Password

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next()
}) //Bài 14 phần 10 : password reset

userSchema.pre(/^find/,function(next){
    // this points to the current query
    this.find({active : {$ne : false}})
    next()
}) //Bài 17 phần 10 : deleting current user

userSchema.methods.correctPassword = async function(candicatePassword,userPassword) {
    return await bcrypt.compare(candicatePassword,userPassword)
}

/* JWTTimestamp cho biết thời gian token issue(phát hành) */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };


const User = mongoose.model('User',userSchema)

module.exports = User