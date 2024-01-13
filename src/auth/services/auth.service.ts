import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { googleOAuthConfig } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(googleOAuthConfig.KEY)
    private oauthConfig: ConfigType<typeof googleOAuthConfig>,
    private readonly httpService: HttpService,
  ) {}

  public async googleLogin(code: string) {
    try {
      const { access_token: accessToken } =
        await this.getGoogleAccessToken(code);
      const account = await this.getGoogleUserInfo(accessToken);

      return { account, accessToken };
    } catch {
      throw new BadRequestException('Invalid code');
    }
  }

  public async getUrls() {
    const googleOauth = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.oauthConfig.clientId}&redirect_uri=${this.oauthConfig.redirectUri}&response_type=code&scope=email+profile+openid&prompt=select_account`;
    const isGoogleOauthEnabled = this.oauthConfig.enabled;
    return {
      google: isGoogleOauthEnabled ? googleOauth : undefined,
    };
  }

  private async getGoogleAccessToken(code: string) {
    const clientId = this.oauthConfig.clientId;
    const clientSecret = this.oauthConfig.clientSecret;
    const redirectUri = this.oauthConfig.redirectUri;

    const url = `https://oauth2.googleapis.com/token?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&access_type=offline&grant_type=authorization_code`;

    const { data } =
      await this.httpService.axiosRef.post<GoogleOauthTokenResponse>(url);

    return data;
  }

  private async getGoogleUserInfo(accessToken: string) {
    const { data } = await this.httpService.axiosRef
      .get<GoogleOauthAccountResponse>(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
      )
      .catch((err) => {
        throw new BadRequestException(err.message);
      });

    return data;
  }
}
