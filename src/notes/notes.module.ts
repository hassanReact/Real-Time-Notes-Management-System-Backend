import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { DatabaseModule } from '../config/database.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    DatabaseModule,
    AnalyticsModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}