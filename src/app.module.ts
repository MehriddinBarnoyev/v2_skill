import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://mbarnoyev46:dX2Dl1rOSEYwmHm1@skillexchange.wjkdnrl.mongodb.net/?retryWrites=true&w=majority&appName=skillExchange'),
    AuthModule,
    UsersModule,
    SkillsModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}