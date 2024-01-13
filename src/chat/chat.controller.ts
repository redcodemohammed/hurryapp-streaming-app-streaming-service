import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import GetChatDto from './dto/get-chat.dto';
import { RedisService } from 'src/redis/redis.service';
import { Public } from 'src/common/decorators';

@Controller('chat')
export class ChatController {
  constructor(private redisService: RedisService) {}

  @Get('/')
  @Public()
  async getChatMessages(@Query('socketId') socketId: GetChatDto['socketId']) {
    // make sure the user is in the dto
    // find the user's room
    try {
      const room = await this.redisService.get(socketId);

      // get the messages from redis
      const messages = await this.redisService.lrange(`${room}-chat`, 0, 49);

      return messages.map((message) => JSON.parse(message));
    } catch (e) {
      throw new BadRequestException('User not found in any room');
    }
  }
}
