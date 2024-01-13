import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { MessageSendDto } from './dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private redisService: RedisService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message:sent')
  async handleMessage(client: Socket, payload: MessageSendDto) {
    const response = {
      user: client.data.user,
      message: payload.message,
    };
    // find the user's room
    const room = await this.redisService.get(client.id);
    // send the message to the room
    this.server.to(room).emit('message:received', response);
    // store the message in redis
    await this.redisService.lpush(`${room}-chat`, JSON.stringify(response));

    // Trim the list to only keep the latest 50 messages
    await this.redisService.ltrim(`${room}-chat`, 0, 49);

    Logger.log(
      `Message sent: ${payload.message} to room: ${room}`,
      'ChatGateway',
    );
  }
}
