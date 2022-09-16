/* eslint-disable prettier/prettier */
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleController');

//...allowedFields : create an array chứa tất cả các đối số mà chúng ta đã truyền vào -> ['email' , 'name']
// eslint-disable-next-line no-unused-vars
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req,res,next) => {
  req.params.id = req.user.id
  next();
}

// Bài 16 - Phần 10 : Updating Current user Data
exports.updateMe = catchAsync(async (req,res,next) => {
  // 1) Create error if user POSTs password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password updates. Please use /updatePassword',400))
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body,'name','email')

  // 3) Update user document 
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  // {new : true} : trả về đối tượng mới ---- runvalidators : true -> validate document(email)

  res.status(200).json({
    status : 'success',
    data : {
      user : updatedUser
    }
  })
})

exports.deleteMe = catchAsync(async(req,res,next) => {
  await User.findByIdAndUpdate(req.user.id, {active : false})

  res.status(204).json({
    status : 'success',
    data : null
  })
  next()
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defind/Please use /signup instead',
  });
};

exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User)
//k dùng để update password
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)