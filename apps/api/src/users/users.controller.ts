import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { CreateUsersDto } from './dtos/create-users.dto';
import { updateUsersDto } from './dtos/update-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUsersDto: CreateUsersDto) {
    return this.usersService.createUser(createUsersDto);
  }

  @Get()
  findAll() {
    return this.usersService.users({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.user({ id: +id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsersDto: updateUsersDto) {
    return this.usersService.update(+id, updateUsersDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}