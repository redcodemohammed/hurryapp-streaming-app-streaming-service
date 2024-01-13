import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountProvider } from '@prisma/client';
import { compare, hash } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocalLoginDto, LocalRegisterDto } from '../dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async findOrCreateUser(
    provider: AccountProvider,
    accountId: string,
    access_token: string,
    email: string,
    name: string,
  ) {
    // find the user by provider and account id
    let user = await this.prisma.user.findFirst({
      where: {
        accounts: { some: { provider, providerAccountId: accountId } },
      },
    });

    // if no user is found, try to find a user by email
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { email } });

      // if a user is found, add the account to the user
      if (user) {
        await this.prisma.user.update({
          data: {
            accounts: {
              push: { provider, providerAccountId: accountId, access_token },
            },
          },
          where: { id: user.id },
        });
      }
    }

    // if no user is found, create a new user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          accounts: [{ provider, providerAccountId: accountId, access_token }],
          emailVerified: new Date(),
        },
      });
    }

    return user;
  }

  public async localLogin({ email, password }: LocalLoginDto) {
    // find the user by email
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user || !user.localAccount) {
      throw new UnauthorizedException('Invalid username of password');
    }

    // compare the password
    const isMatch = await compare(password, user.localAccount.password);

    // if the password matches, return the user
    if (isMatch) {
      return user;
    } else {
      throw new UnauthorizedException('Invalid username of password');
    }
  }

  public async localRegister(dto: LocalRegisterDto) {
    // check if the email is already registered
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    // if the email is already registered, throw an error
    if (user && user.localAccount) {
      throw new ConflictException('Email already registered');
    }

    if (user && !user.localAccount) {
      await this.prisma.user.update({
        data: {
          localAccount: { set: { password: await hash(dto.password) } },
        },
        where: { id: user.id },
      });

      return user;
    }

    // hash the password
    const password = await hash(dto.password);

    // create the user
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        localAccount: { set: { password } },
      },
    });

    return newUser;
  }

  public async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
