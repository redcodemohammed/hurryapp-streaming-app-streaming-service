import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayloadEntity } from 'src/auth/entities';
import { UsersService } from 'src/auth/services';
import { jwtConfig } from 'src/config';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'rt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      secretOrKey: jwtConfig().refreshTokenSecret,
      ignoreExpiration: true,
    });
  }

  async validate(payload: RefreshTokenPayloadEntity) {
    const user = await this.usersService.findOne(payload.sub);

    return user;
  }
}
