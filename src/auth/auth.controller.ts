import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators';
import { exclude } from 'src/common/utils';
import { UsersService } from './services';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  public async me(@CurrentUser() user: User) {
    return exclude(user, ['password']);
  }
}
