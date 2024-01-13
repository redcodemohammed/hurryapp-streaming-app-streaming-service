import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService, SessionsService, UsersService } from './services';
import { HttpModule } from '@nestjs/axios';
import { AtAuthGuard, RtAuthGuard } from './guards';
import { AtStrategy, RtStrategy } from './strategies';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    SessionsService,
    AtAuthGuard,
    RtAuthGuard,
    AtStrategy,
    RtStrategy,
    {
      provide: APP_GUARD,
      useClass: AtAuthGuard,
    },
  ],
})
export class AuthModule {}
