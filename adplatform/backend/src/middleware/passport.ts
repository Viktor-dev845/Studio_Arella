import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db/pool';

// Our Google strategy resolves/creates the user and passes it through
// Passport's done() — the actual session token is issued in googleCallback
// (via the shared issueSessionToken helper, same as password login), since
// that's a real Express handler with req access and can write a real
// `sessions` row. Signing a token here directly would carry no jti, so it
// would never show up in Active Sessions and could never be revoked.
// We cast to `any` because Passport's generic User type is set to
// { id, email, role } (matching the authenticate middleware), but this
// payload intentionally carries a richer shape read immediately in
// googleCallback and never touches req.user generically.

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email returned from Google'), false);
        }

        // Check if user already exists by email
        const existing = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );

        let user: any;

        if (existing.rows.length > 0) {
          const result = await pool.query(
            `UPDATE users
             SET avatar = COALESCE(avatar, $1),
                 google_id = COALESCE(google_id, $2)
             WHERE email = $3
             RETURNING id, name, email, role, credits, avatar, terms_accepted`,
            [avatar, googleId, email]
          );
          user = result.rows[0];
        } else {
          const result = await pool.query(
            `INSERT INTO users (name, email, avatar, google_id, role, password)
             VALUES ($1, $2, $3, $4, 'advertiser', '')
             RETURNING id, name, email, role, credits, avatar, terms_accepted`,
            [name, email, avatar, googleId]
          );
          user = result.rows[0];
          user.isNew = true;
        }

        // Cast to any to satisfy Passport's strict Express.User typing.
        // googleCallback reads this user directly from req.user and issues
        // the real session token itself.
        return done(null, user as any);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

export default passport;
