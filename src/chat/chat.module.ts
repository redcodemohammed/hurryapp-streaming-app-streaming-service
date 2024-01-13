import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { MessagesService } from './services/messages/messages.service';

@Module({
  providers: [ChatGateway, MessagesService],
  controllers: [ChatController],
})
export class ChatModule {}
