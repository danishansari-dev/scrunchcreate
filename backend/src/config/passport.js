const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
          const avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

          if (!email) {
            return done(new Error('No email found from Google'), false);
          }

          // Try to find an existing user by email
          let user = await User.findOne({ email });

          if (user) {
            // Link googleId and avatar if missing
            if (!user.googleId || !user.avatar) {
              user.googleId = profile.id;
              user.avatar = avatar;
              await user.save();
            }
            return done(null, user);
          } else {
            // If the user doesn't exist, create a new one
            user = await User.create({
              name: profile.displayName || 'Google User',
              email,
              googleId: profile.id,
              avatar,
              // Password is not provided, handled conditionally in the User model
            });
            return done(null, user);
          }
        } catch (error) {
          console.error('Error during Google authentication:', error);
          return done(error, false);
        }
      }
    )
  );
} else {
  console.warn('Google Client ID or Secret is missing. Google OAuth will not work.');
}

module.exports = passport;
