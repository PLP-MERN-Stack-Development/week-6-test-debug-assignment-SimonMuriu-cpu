const { generateToken, verifyToken, extractToken } = require('../../src/utils/auth');
const User = require('../../src/models/User');

describe('Auth Utils', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      const token = generateToken(user);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user information in token payload', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(user._id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user._id);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      
      expect(() => {
        verifyToken(malformedToken);
      }).toThrow();
    });
  });

  describe('extractToken', () => {
    it('should extract token from Bearer authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;
      
      const extracted = extractToken(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for missing authorization header', () => {
      const extracted = extractToken(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for non-Bearer authorization header', () => {
      const authHeader = 'Basic dXNlcjpwYXNz';
      const extracted = extractToken(authHeader);
      expect(extracted).toBeNull();
    });

    it('should return null for malformed Bearer header', () => {
      const authHeader = 'Bearer';
      const extracted = extractToken(authHeader);
      expect(extracted).toBe('');
    });
  });
});

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const originalHash = user.password;
      user.username = 'updateduser';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should exclude password from JSON output', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.username).toBe('testuser');
      expect(userJSON.email).toBe('test@example.com');
    });
  });

  describe('Validation', () => {
    it('should require username', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(/username/i);
    });

    it('should require email', async () => {
      const user = new User({
        username: 'testuser',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(/email/i);
    });

    it('should require password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com'
      });

      await expect(user.save()).rejects.toThrow(/password/i);
    });

    it('should validate email format', async () => {
      const user = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(/email/i);
    });

    it('should enforce minimum username length', async () => {
      const user = new User({
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(/username/i);
    });

    it('should enforce minimum password length', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      });

      await expect(user.save()).rejects.toThrow(/password/i);
    });
  });
});