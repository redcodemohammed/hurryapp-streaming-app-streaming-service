import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
