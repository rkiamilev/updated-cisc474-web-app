import { Injectable } from '@nestjs/common';

import { User } from '@repo/database';

import { CreateUsersDto } from './dtos/create-users.dto';
import { updateUsersDto } from './dtos/update-users.dto';

@Injectable()
export class UsersService {
  private readonly _users: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'student',
    },
  ];

  create(createUsersDto: CreateUsersDto) {
    return `This action adds a new user ${createUsersDto}`;
  }

  findAll() {
    return this._users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUsersDto: updateUsersDto) {
    return `This action updates a #${id} user ${updateUsersDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}