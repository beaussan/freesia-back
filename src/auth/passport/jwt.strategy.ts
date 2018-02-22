import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Component, Inject, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { SECRET_KEY } from '../constant';

@Component()
export class JwtStrategy extends Strategy {
    private readonly logger = new Logger('JwtStrategy', true);
    constructor(private readonly authService: AuthService) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
                secretOrKey: SECRET_KEY,
            },
            async (req, payload, next) => await this.verify(req, payload, next),
        );
        passport.use(this);
    }

    public async verify(req, payload, done) {
        this.logger.log('For payload : ' + JSON.stringify(payload));
        this.logger.log('For req.user : ' + JSON.stringify(req.user));
        const isValid = await this.authService.validateUser(payload);
        if (!isValid) {
            return done('Unauthorized', false);
        }
        done(null, payload);
    }
}
