import { Controller } from '@nestjs/common';
import { Get, Param } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll() {
    return this.articlesService.articles({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.article({ id: Number(id) });
  }
}
