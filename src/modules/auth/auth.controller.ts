import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SignupResponseDto } from './dto/signup.response.dto';
import { LoginRequestDto } from './dto/login.request.dto';
import { LoginResponseDto } from './dto/login.response.dto';
import { Public } from '../shared/decorators';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user.response.dto';

interface GoogleUser {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
  };
  accessToken: string;
  refreshToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: SignupResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signup(@Body() signupDto: SignupRequestDto): Promise<SignupResponseDto> {
    const { user, accessToken } = await this.authService.signup(signupDto);

    return {
      accessToken,
      user: plainToInstance(UserResponseDto, user),
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { user, accessToken } = await this.authService.login(loginDto);

    return {
      accessToken,
      user: plainToInstance(UserResponseDto, user),
    };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google login successful', type: LoginResponseDto })
  async googleAuthRedirect(@Req() req: Request): Promise<LoginResponseDto> {
    const googleUser = req.user as unknown as GoogleUser;
    const { user, accessToken } = await this.authService.googleLogin(googleUser.user);

    return {
      accessToken,
      user: plainToInstance(UserResponseDto, user),
    };
  }
}
