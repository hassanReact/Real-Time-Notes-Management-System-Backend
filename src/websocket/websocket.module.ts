import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGateway } from './websocket.gateway';
import { DatabaseModule } from '../config/database.module';
import { JwtConfigService } from '../config/jwt.config';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  providers: [WebSocketGateway, JwtConfigService],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}