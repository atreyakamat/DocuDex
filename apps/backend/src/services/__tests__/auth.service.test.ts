import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
const { authenticator } = require('otplib');
import QRCode from 'qrcode';
import {
  registerUser,
  loginUser,
  setupMFA,
  verifyMFASetup,
  disableMFA,
  verifyMfaLogin,
} from '../auth.service';
import { pool } from '../../config/database';
import { generateMfaToken } from '../../utils/jwt';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('bcryptjs');
jest.mock('qrcode');

describe('Auth Service - MFA & Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setupMFA', () => {
    it('should generate a secret and QR code', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ email: 'test@example.com', mfa_enabled: false }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Update statement
      (QRCode.toDataURL as jest.Mock).mockResolvedValueOnce('data:image/png;base64,mockqrcodedata');

      const result = await setupMFA('user-id');
      
      expect(result.qrCodeUrl).toBe('data:image/png;base64,mockqrcodedata');
      expect(result.secret).toBeDefined();
      expect(pool.query).toHaveBeenCalledWith('UPDATE users SET mfa_secret = $1 WHERE id = $2', [result.secret, 'user-id']);
    });
  });

  describe('verifyMFASetup', () => {
    it('should verify the code and enable MFA', async () => {
      const secret = authenticator.generateSecret();
      const code = authenticator.generate(secret);

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ mfa_secret: secret }] }); // Select
      (pool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ id: 'user-id', email: 'test@example.com', mfa_enabled: true, created_at: new Date(), updated_at: new Date() }] 
      }); // Update

      const result = await verifyMFASetup('user-id', code);
      
      expect(result.mfaEnabled).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET mfa_enabled = true'),
        ['user-id']
      );
    });

    it('should throw error on invalid code', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ mfa_secret: 'secret' }] });

      await expect(verifyMFASetup('user-id', '000000')).rejects.toThrow('Invalid MFA code');
    });
  });

  describe('loginUser', () => {
    it('should return mfaToken if mfa_enabled is true', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ id: 'user-id', email: 'test@test.com', password_hash: 'hash', mfa_enabled: true, role: 'user', created_at: new Date(), updated_at: new Date() }] 
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await loginUser({ email: 'test@test.com', password: 'password' });

      expect(result.requiresMfa).toBe(true);
      expect(result.mfaToken).toBeDefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should return tokens directly if mfa_enabled is false', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ id: 'user-id', email: 'test@test.com', password_hash: 'hash', mfa_enabled: false, role: 'user', created_at: new Date(), updated_at: new Date() }] 
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await loginUser({ email: 'test@test.com', password: 'password' });

      expect(result.requiresMfa).toBeUndefined();
      expect(result.tokens?.accessToken).toBeDefined();
    });
  });
});