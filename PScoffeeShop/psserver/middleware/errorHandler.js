/*
We use err.message so generic error messages are displayed rather than real failures that may leak information.
This is an issue that was occurring before, where "Error: "+err was printing straight to browse, creating a disclosure problem
*/ 
function errorHandler(err, req, res, next) {
  const status = err.status || 500; //error 500 is internal server error

  console.error(`[${status}] ${err.message}`);

  res.status(status).json({
    message: status === 500 ? 'An unexpected error occurred' : err.message,
    details: err.details
  });
}

module.exports = errorHandler;