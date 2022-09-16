/* eslint-disable prettier/prettier */
class AppError extends Error {
    constructor (message,statusCode){
        super(message); //message là tham số duy nhất mà Error tích hợp chấp nhận

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports = AppError;