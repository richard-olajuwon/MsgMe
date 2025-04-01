// Error Handler Middlware

const createError = require('http-errors');

const errorHandler = (err, req, res, next) => {
    // Set the default status code to 500 (Internal Server Error)
    let statusCode = err.status || 500;

    // If the error is an instance of http-errors, we use its status and message
    if (createError.isHttpError(err)) {
        statusCode = err.status;
    }

    // Log the error details (can be enhanced for production logging)
    console.error({
        message: err.message,
        stack: err.stack,
        statusCode: statusCode,
    });

    // Response structure
    const response = {
        status: 'error',
        error: 'Internal Server Error, Try again Later',
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    };

    // Send the response to the client
    res.status(statusCode).json(response);
};

module.exports = errorHandler;
