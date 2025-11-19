import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { User } from '@repo/database';

import { CreateUserDto } from './dtos/create-users.dto';
import { updateUserDto } from './dtos/update-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(CreateUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: CreateUserDto.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists.');
      }

      return await this.prisma.user.create({data: CreateUserDto});
  } catch (error) {
      throw new Error(`Failed to create user`);
    }
}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({});
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: id }
    });

  if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: number): Promise<User> {
    const user = await this.prisma.user.delete({
      where : { id: id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: updateUserDto): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id: id },
        data: updateUserDto
      });
      return user;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error['code'] === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      if ((error as any).code === 'P2002') {
        throw new Error('Email already in use.');
      }

    throw new Error(`Failed to update user with ID ${id}`);
    }
  }
}