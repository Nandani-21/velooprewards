export function errorHandler(error, request, response, next) {
  console.error(error);
  const statusCode = error.statusCode || (error.code === 11000 ? 409 : 500);
  const code = error.code === 11000 ? 'DUPLICATE_RESOURCE' : error.code || 'INTERNAL_ERROR';
  response.status(statusCode).json({ success: false, code, message: error.publicMessage || error.message || (error.code === 11000 ? 'This operation has already been processed.' : 'An unexpected server error occurred.') });
}
