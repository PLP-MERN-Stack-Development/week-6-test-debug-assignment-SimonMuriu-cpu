const errorHandler = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should handle CastError (invalid ObjectId)', () => {
    const error = {
      name: 'CastError',
      message: 'Cast to ObjectId failed'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Resource not found'
    });
  });

  it('should handle duplicate key error (code 11000)', () => {
    const error = {
      code: 11000,
      keyValue: { email: 'test@example.com' },
      message: 'Duplicate key error'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: 'email already exists'
    });
  });

  it('should handle ValidationError', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        username: { message: 'Username is required' },
        email: { message: 'Email is required' }
      },
      message: 'Validation failed'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Username is required, Email is required'
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = {
      name: 'JsonWebTokenError',
      message: 'invalid token'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid token'
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = {
      name: 'TokenExpiredError',
      message: 'jwt expired'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token expired'
    });
  });

  it('should handle generic errors with default 500 status', () => {
    const error = {
      message: 'Something went wrong'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Something went wrong'
    });
  });

  it('should use default error message for unknown errors', () => {
    const error = {};

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error'
    });
  });

  it('should include stack trace in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = {
      message: 'Test error',
      stack: 'Error stack trace'
    };

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Test error',
      stack: 'Error stack trace'
    });

    process.env.NODE_ENV = originalEnv;
  });
});