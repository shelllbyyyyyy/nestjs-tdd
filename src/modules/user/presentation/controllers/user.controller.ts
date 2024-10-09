import { Controller, Get, HttpStatus, Query } from '@nestjs/common';

import { UserService } from '../../application/services/user.service';
import { ApiResponse, MyResponse } from '@/common/response/api';
import { User } from '../../domain/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findOne(
    @Query('id') id?: string,
    @Query('email') email?: string,
  ): Promise<ApiResponse<User>> {
    let result: User;

    if (id) {
      result = await this.userService.findOneById(id);
    } else if (email) {
      result = await this.userService.findOneByEmail(email);
    }

    return MyResponse(HttpStatus.OK, 'User found', result);
  }
}
