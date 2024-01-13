import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { jwtConfig as JWTConfig } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AccessTokenPayloadEntity,
  RefreshTokenPayloadEntity,
  TokensEntity,
} from '../entities';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(JWTConfig.KEY)
    private jwtConfig: ConfigType<typeof JWTConfig>,
  ) {}

  public async login(
    user: User,
    deviceIP: string,
    deviceName: string,
  ): Promise<TokensEntity> {
    const refreshToken = await this.makeRefreshToken(user);
    const accessToken = await this.makeAccessToken(refreshToken);

    await this.prisma.session.create({
      data: {
        sessionToken: refreshToken,
        user: {
          connect: {
            id: user.id,
          },
        },
        deviceIP,
        deviceName,
      },
    });

    return {
      refreshToken,
      accessToken,
    };
  }

  public logout(id: string, token: string) {
    return this.prisma.session.deleteMany({
      where: {
        sessionToken: token,
        userId: id,
      },
    });
  }

  public findAllSessions(id: string) {
    return this.prisma.session.findMany({
      where: {
        userId: id,
      },
    });
  }

  private async makeRefreshToken(user: User): Promise<string> {
    const payload: RefreshTokenPayloadEntity = {
      email: user.email,
      sub: user.id,
    };
    const refreshToken = this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshTokenSecret,
    });

    return refreshToken;
  }

  public async makeAccessToken(refreshToken: string): Promise<string> {
    const { email, sub } =
      await this.jwtService.verifyAsync<RefreshTokenPayloadEntity>(
        refreshToken,
        {
          secret: this.jwtConfig.refreshTokenSecret,
          ignoreExpiration: true,
        },
      );

    const payload: AccessTokenPayloadEntity = { email, sub };

    const accessToken = this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessTokenSecret,
      expiresIn: this.jwtConfig.accessTokenExpireTime,
    });

    return accessToken;
  }
}
