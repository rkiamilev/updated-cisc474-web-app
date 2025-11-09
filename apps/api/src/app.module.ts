import { Module } from '@nestjs/common';

import { LinksModule } from '../links/links.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ArticlesModule } from './articles/articles.module';
// import { UsersModule } from './users/users.module';
// import { WordsModule } from './words/words.module';

@Module({
  imports: [LinksModule, ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
