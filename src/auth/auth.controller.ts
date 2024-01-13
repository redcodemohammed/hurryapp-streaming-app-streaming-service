import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Ip,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Session, User } from '@prisma/client';
import { CurrentUser, Public } from 'src/common/decorators';
import { exclude } from 'src/common/utils';
import { GoogleLoginDto, LocalLoginDto, LocalRegisterDto } from './dto';
import { TokensEntity } from './entities';
import { RtAuthGuard } from './guards';
import { AuthService, SessionsService, UsersService } from './services';
import { googleOAuthConfig as GoogleOAuthConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    @Inject(GoogleOAuthConfig.KEY)
    private googleOAuthConfig: ConfigType<typeof GoogleOAuthConfig>,
  ) {}

  @Post('local/login')
  @Public()
  async login(
    @Body() dto: LocalLoginDto,
    @Req() request: Request,
    @Ip() ip: string,
  ) {
    const user = await this.usersService.localLogin(dto);

    const deviceName = request.headers['user-agent'] || 'Unknown device';

    const tokens = await this.sessionsService.login(user, ip, deviceName);

    return tokens;
  }

  @Post('local/register')
  @Public()
  async register(
    @Body() dto: LocalRegisterDto,
    @Req() request: Request,
    @Ip() ip: string,
  ) {
    const user = await this.usersService.localRegister(dto);

    const deviceName = request.headers['user-agent'] || 'Unknown device';

    const tokens = await this.sessionsService.login(user, ip, deviceName);

    return tokens;
  }

  @Get('urls')
  @Public()
  public async getUrls() {
    return this.authService.getUrls();
  }

  @Post('google')
  @Public()
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({ status: 200, type: TokensEntity })
  public async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Req() request: Request,
    @Ip() ip: string,
  ) {
    if (!this.googleOAuthConfig.enabled) {
      throw new BadRequestException('Google OAuth is not enabled');
    }

    const { accessToken, account } = await this.authService.googleLogin(
      dto.code,
    );

    const user = await this.usersService.findOrCreateUser(
      'GOOGLE',
      account.id,
      accessToken,
      account.email,
      account.name,
    );

    const deviceName = request.headers['user-agent'] || 'Unknown device';

    const tokens = await this.sessionsService.login(user, ip, deviceName);

    return tokens;
  }

  @Post('refresh')
  @Public()
  @UseGuards(RtAuthGuard)
  public async refresh(@Body('token') token: string) {
    const accessToken = await this.sessionsService.makeAccessToken(token);

    return { accessToken };
  }

  @Get('sessions')
  public async sessions(
    @CurrentUser() user: User,
  ): Promise<Omit<Session, 'sessionToken'>[]> {
    const sessions = await this.sessionsService.findAllSessions(user.id);

    return sessions.map((session) => exclude(session, ['sessionToken']));
  }

  @Get('me')
  public async me(@CurrentUser() user: User) {
    return exclude(user, ['accounts', 'localAccount']);
  }

  @Get('accounts')
  public async accounts(@CurrentUser() user: User) {
    return {
      localAccount: exclude(user.localAccount, ['password']),
      oauthAccounts: user.accounts.map((account) =>
        exclude(account, ['access_token', 'providerAccountId']),
      ),
    };
  }

  @Post('logout')
  @Public()
  @UseGuards(RtAuthGuard)
  public async logout(@CurrentUser() user: User, @Body('token') token: string) {
    await this.sessionsService.logout(user.id, token);

    return { message: 'Logged out successfully' };
  }
}
