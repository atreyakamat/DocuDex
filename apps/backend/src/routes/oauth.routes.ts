import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from '../config/database';
import { config } from '../config/env';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Only configure Google Strategy if env variables are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/oauth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user already exists
          const existingUserResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          let userRow;

          if (existingUserResult.rows.length > 0) {
            userRow = existingUserResult.rows[0];
            // Link OAuth if not linked
            if (!userRow.oauth_id) {
              await pool.query(
                'UPDATE users SET oauth_provider = $1, oauth_id = $2, is_email_verified = true WHERE id = $3',
                ['google', profile.id, userRow.id]
              );
            }
          } else {
            // Create new user
            const id = uuidv4();
            const fullName = profile.displayName || email.split('@')[0];
            const result = await pool.query(
              `INSERT INTO users (id, email, full_name, role, is_email_verified, oauth_provider, oauth_id)
               VALUES ($1, $2, $3, 'user', true, 'google', $4)
               RETURNING *`,
              [id, email, fullName, profile.id]
            );
            userRow = result.rows[0];
          }

          done(null, userRow);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Redirect to frontend with tokens
      const frontendUrl = config.frontendUrl || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } catch (error) {
      const frontendUrl = config.frontendUrl || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

export default router;
