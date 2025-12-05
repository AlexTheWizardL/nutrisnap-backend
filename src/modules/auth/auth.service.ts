import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { SignupRequestDto } from './dto/signup.request.dto';
import { LoginRequestDto } from './dto/login.request.dto';
import { User } from '../user/entities/user.entity';
import { JwtPayload } from '../shared/interfaces';
import { UserRole, AuthProvider } from '../shared/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupDto: SignupRequestDto): Promise<{ user: User; accessToken: string }> {
    const existingUser = await this.userService.findByEmail(signupDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create({
      email: signupDto.email,
      password: signupDto.password,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      roles: [UserRole.USER],
      provider: AuthProvider.LOCAL,
    });

    const accessToken = this.generateToken(user);

    try {
      await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'User');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return { user, accessToken };
  }

  async login(loginDto: LoginRequestDto): Promise<{ user: User; accessToken: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const accessToken = this.generateToken(user);

    return { user, accessToken };
  }

  async googleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
  }): Promise<{ user: User; accessToken: string }> {
    let user = await this.userService.findByProviderAndId(
      AuthProvider.GOOGLE,
      googleUser.providerId,
    );

    if (!user) {
      user = await this.userService.findByEmail(googleUser.email);

      if (user) {
        throw new ConflictException('Email already exists with different provider');
      }

      user = await this.userService.create({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        provider: AuthProvider.GOOGLE,
        providerId: googleUser.providerId,
        roles: [UserRole.USER],
        password: '',
      });

      try {
        await this.mailService.sendWelcomeEmail(user.email, user.firstName || 'User');
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    const accessToken = this.generateToken(user);

    return { user, accessToken };
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }
}
