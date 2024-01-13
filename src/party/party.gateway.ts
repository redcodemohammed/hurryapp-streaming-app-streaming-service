import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { UserJoinDto } from './dto';
import { jwtConfig } from 'src/config';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class PartyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  @SubscribeMessage('user:joined')
  async handleMessage(client: Socket, payload: UserJoinDto) {
    const party = `party-${payload.id}`;
    // add a user to a party
    await this.redisService.sadd(party, client.id);
    client.join(party);

    // set the user's party
    await this.redisService.set(client.id, party);

    // get the users in the party
    const users = await this.redisService.smembers(party);

    this.server.to(party).emit('user:joined', { members: users.length });
  }

  @SubscribeMessage('user:left')
  async handleLeave(client: Socket) {
    // get the user's party
    const party = await this.redisService.get(client.id);
    // remove the user from the party
    await this.redisService.srem(party, client.id);

    // remove the user's party
    await this.redisService.del(client.id);

    // get the users in the party
    const users = await this.redisService.smembers(party);

    this.server.to(party).emit('user:left', { members: users.length });
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      const decoded = this.jwtService.verify(token, {
        secret: jwtConfig().accessTokenSecret,
      }); // Replace with your validation logic
      // Optionally attach user information to the client object
      client.data.user = decoded;

      Logger.log(`Client connected: ${client.data.user.id}`, 'ChatGateway');
    } catch (error) {
      client.disconnect(); // Disconnect the client if the token is invalid
      Logger.log(`Client disconnected: ${client.id}`, 'ChatGateway');
    }
  }

  async handleDisconnect(client: any) {
    Logger.log(`Client disconnected: ${client.data.user.id}`, 'ChatGateway');

    // get the user's current party
    const party = await this.redisService.get(client.id);

    // remove the user from the party
    await this.redisService.srem(party, client.id);

    // remove the user's party

    await this.redisService.del(client.id);

    // get the users in the party

    const users = await this.redisService.smembers(party);

    this.server.to(party).emit('user:left', { members: users.length });
  }
}
