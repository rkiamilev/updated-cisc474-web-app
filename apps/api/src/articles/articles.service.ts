import { Injectable } from '@nestjs/common';
import { Article } from '@repo/database';

import { CreateArticleDto } from './dtos/create-article.dto';
import { UpdateArticleDto } from './dtos/update-article.dto';

@Injectable()
export class ArticlesService {
  private readonly _articles: Article[] = [
    {
      id: 1,
      title: 'First Article',
      content: 'This is the content of the first article.',
      difficulty: 'Easy',
      publishedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      author: 'Author A',
    },
  ];

  create(createArticleDto: CreateArticleDto) {
    return `This action adds a new article ${createArticleDto}`;
  }

  findAll() {
    return this._articles;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article ${updateArticleDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}