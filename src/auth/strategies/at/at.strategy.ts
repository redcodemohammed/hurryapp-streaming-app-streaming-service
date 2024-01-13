import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/auth/services';
import { jwtConfig, servicesConfig as ServicesConfig } from 'src/config';
import { User } from '@prisma/client';
import { Request } from 'express';
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'at') {
  constructor(
    @Inject(ServicesConfig.KEY)
    private readonly servicesConfig: ConfigType<typeof ServicesConfig>,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig().accessTokenSecret,
      ignoreExpiration: false,
      passReqToCallback: true, // Enable request object in validate method
    });
  }

  async validate(request: Request) {
    const user = await this.httpService.axiosRef.get<User>(
      `${this.servicesConfig.url}/me.php`,
      {
        headers: {
          Authorization: request.headers.authorization.split(' ')[1],
        },
      },
    );

    return user.data;
  }
}
