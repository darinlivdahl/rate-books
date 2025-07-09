import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { findUserByEmail, findUserById, createUser } from '../models/userModel.mjs';
import dotenv from 'dotenv';
dotenv.config();

export const setupStrategies = (passport) => {
    passport.use(new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                const user = await findUserByEmail(email);
                if (!user) return done(null, false, { message: 'No user found' });
                const match = await bcrypt.compare(password, user.password);
                return match ? done(null, user) : done(null, false, { message: 'Incorrect password' });
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                let user = await findUserByEmail(email);
                if (!user) {
                    user = await createUser({ name: profile.displayName, email, password: '' });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await findUserById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};