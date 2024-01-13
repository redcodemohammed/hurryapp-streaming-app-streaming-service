import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AtAuthGuard } from './guards';
import { UsersService } from './services';
import { AtStrategy } from './strategies';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [
    UsersService,
    AtAuthGuard,
    AtStrategy,
    {
      provide: APP_GUARD,
      useClass: AtAuthGuard,
    },
  ],
})
export class AuthModule {}
