import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayloadEntity } from 'src/auth/entities';
import { UsersService } from 'src/auth/services';
import { jwtConfig } from 'src/config';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'at') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig().accessTokenSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessTokenPayloadEntity) {
    const user = await this.usersService.findOne(payload.sub);

    return user;
  }
}
