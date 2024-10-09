import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { CreateUserDto } from '@/modules/user/presentation/controllers/dto/create-user.dto';

import { AuthService } from '@/modules/auth/application/services/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiResponse, MyResponse } from '@/common/response/api';
import { LocalAuthGuard } from '@/shared/passport/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    const { access_token, refresh_token } = await this.authService.login(data);

    res.cookie('access_token', access_token, {
      httpOnly: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    res
      .status(HttpStatus.OK)
      .json(MyResponse(HttpStatus.OK, 'Login Successfully', null));
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<{ id: string }>> {
    const result = await this.authService.register(createUserDto);

    return MyResponse(HttpStatus.CREATED, 'Register Successfully', {
      id: result.id,
    });
  }
}
