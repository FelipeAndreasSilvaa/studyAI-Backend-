import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDTO';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() body: LoginDto) {
      return this.authService.login(
        body.email,
        body.password,
      );
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    getMe(@Request() req: any) {
      return req.user;
    }
}
