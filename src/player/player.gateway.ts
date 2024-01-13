import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import PlayerSeekDto from './dto/player-seek.dto';

@WebSocketGateway()
export class PlayerGateway {
  constructor(private redisService: RedisService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('player:start')
  async startPlayer(client: Socket) {
    // find the user's room
    const room = await this.redisService.get(client.id);

    // send the message to the room
    this.server.to(room).emit('player:started');
    Logger.log(`Room ${room} video started`, 'PlayerGateway');
  }

  @SubscribeMessage('player:pause')
  async stopPlayer(client: Socket) {
    // find the user's room
    const room = await this.redisService.get(client.id);

    // send the message to the room
    this.server.to(room).emit('player:paused');
    Logger.log(`Room ${room} video started`, 'PlayerGateway');
  }

  @SubscribeMessage('video:seek')
  async seekVideo(client: Socket, payload: PlayerSeekDto) {
    // find the user's room
    const room = await this.redisService.get(client.id);

    // send the message to the room
    this.server.to(room).emit('video:seeked', payload);
    Logger.log(
      `Room ${room} video seeked to ${payload.position}`,
      'PlayerGateway',
    );
  }
}
