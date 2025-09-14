// NestJS ke WebSocketGateway, WebSocketServer, SubscribeMessage, etc. import kar rahe hain
import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

// socket.io se Server aur Socket class import ho rahi hai
import { Server, Socket } from 'socket.io';

// NestJS ke UseGuards aur Logger import ho rahe hain (UseGuards yahan use nahi ho raha)
import { UseGuards, Logger } from '@nestjs/common';

// JWT service import ho raha hai, token verify karne ke liye
import { JwtService } from '@nestjs/jwt';

// PrismaService import ho raha hai, database access ke liye
import { PrismaService } from '../config/database.config';

// Socket ka ek custom interface bana rahe hain, jisme userId optional hai
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// WebSocketGateway decorator se Gateway define ho raha hai
@NestWebSocketGateway({
  cors: {
    // CORS ke liye frontend URL set kar rahe hain, ya default localhost
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  // Namespace set kar rahe hain '/notifications'
  namespace: '/notifications',
})
// Gateway class bana rahe hain, jo OnGatewayConnection aur OnGatewayDisconnect implement karti hai
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // WebSocketServer decorator se server ka instance milta hai
  @WebSocketServer()
  server: Server;

  // Logger ka instance bana rahe hain, logging ke liye
  private readonly logger = new Logger(WebSocketGateway.name);

  // Map bana rahe hain, jisme userId se socketId map hoga (connected users track karne ke liye)
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  // Constructor me JWT service aur Prisma service inject ho rahi hai
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // Jab naya client connect hota hai, yeh method call hota hai
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Token nikal rahe hain handshake se (auth me ya headers me)
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      // Agar token nahi mila, to warning log karo aur client ko disconnect kar do
      if (!token) {
        this.logger.warn(`Client ${client.id} attempted to connect without token`);
        client.disconnect();
        return;
      }

      // Token verify kar rahe hain, payload nikal rahe hain
      const payload = this.jwtService.verify(token);

      // Database se user nikal rahe hain, payload ke sub (user id) se
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      // Agar user nahi mila, to warning log karo aur client ko disconnect kar do
      if (!user) {
        this.logger.warn(`Client ${client.id} attempted to connect with invalid user`);
        client.disconnect();
        return;
      }

      // Client object me userId set kar rahe hain
      client.userId = user.id;

      // Connected users map me userId aur socketId store kar rahe hain
      this.connectedUsers.set(user.id, client.id);
      
      // Log kar rahe hain ki user connect ho gaya
      this.logger.log(`User ${user.name} connected with socket ${client.id}`);
      
      // User ko uske personal room me join karwa rahe hain
      client.join(`user:${user.id}`);
      
      // Client ko confirmation message bhej rahe hain
      client.emit('connected', { message: 'Successfully connected to notifications' });
      
    } catch (error) {
      // Agar koi error aayi, to error log karo aur client ko disconnect kar do
      this.logger.error(`Connection error for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  // Jab client disconnect hota hai, yeh method call hota hai
  handleDisconnect(client: AuthenticatedSocket) {
    // Agar client me userId hai, to usko connectedUsers se hata do
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      // Log karo ki user disconnect ho gaya
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  // Jab 'join-room' event aata hai, yeh method call hota hai
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    // Agar client authenticated nahi hai, to kuch mat karo
    if (!client.userId) return;
    
    // Client ko specified room me join karwa do
    client.join(data.room);
    // Log karo ki user ne room join kiya
    this.logger.log(`User ${client.userId} joined room ${data.room}`);
    // Client ko confirmation bhejo
    client.emit('joined-room', { room: data.room });
  }

  // Jab 'leave-room' event aata hai, yeh method call hota hai
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    // Agar client authenticated nahi hai, to kuch mat karo
    if (!client.userId) return;
    
    // Client ko specified room se nikal do
    client.leave(data.room);
    // Log karo ki user ne room chhoda
    this.logger.log(`User ${client.userId} left room ${data.room}`);
    // Client ko confirmation bhejo
    client.emit('left-room', { room: data.room });
  }

  // Kisi specific user ko notification bhejne ka method
  sendNotificationToUser(userId: string, notification: any) {
    // User ke personal room me notification emit karo
    this.server.to(`user:${userId}`).emit('notification', notification);
    // Log karo ki notification bheja gaya
    this.logger.log(`Sent notification to user ${userId}`);
  }

  // Note update sabhi users ko bhejne ka method (jinhe access hai)
  sendNoteUpdate(userIds: string[], noteUpdate: any) {
    // Har user ke personal room me note update emit karo
    userIds.forEach(userId => {
      this.server.to(`user:${userId}`).emit('note-updated', noteUpdate);
    });
    // Log karo ki kitne users ko update bheja gaya
    this.logger.log(`Sent note update to ${userIds.length} users`);
  }

  // System-wide announcement broadcast karne ka method
  broadcastSystemMessage(message: any) {
    // Sabhi clients ko system-message emit karo
    this.server.emit('system-message', message);
    // Log karo ki system message broadcast hua
    this.logger.log('Broadcasted system message');
  }

  // Connected users ki count nikalne ka method
  getConnectedUsersCount(): number {
    // Map ki size return karo
    return this.connectedUsers.size;
  }

  // Check karo ki koi user online hai ya nahi
  isUserOnline(userId: string): boolean {
    // Map me userId exist karta hai ya nahi, yeh check karo
    return this.connectedUsers.has(userId);
  }
}