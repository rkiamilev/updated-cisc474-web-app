import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
// apps/api/src/users/users.service.ts

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.users({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.user({ id: Number(id) });
  }
}