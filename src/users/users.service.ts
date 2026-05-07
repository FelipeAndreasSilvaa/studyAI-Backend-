import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    return  this.prisma.user.create({
      data:{
        ...createUserDto,
        password: hashedPassword
      }
    });
  }

  // COMPARE EMAIL AND PASSWORD
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }


  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({where: {id}});
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update
    (
      {where: {id}, 
      data: updateUserDto
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({where: {id}});
  }
}
