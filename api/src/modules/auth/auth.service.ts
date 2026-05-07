import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service'; // 👈 Injeção do Prisma (ajuste o caminho se necessário)
import { LoginDto } from '../debts/dto/login.dto';  
import { RegisterDto } from '../debts/dto/register.dto'; 

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // 👈 Prisma substitui o userModel
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = registerDto;

    // 👈 Busca via Prisma (findUnique é mais rápido e otimizado para índices únicos como email)
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 👈 Criação direta via Prisma (substitui o new Model() + save())
    await this.prisma.user.create({ 
      data: { 
        email, 
        password: hashedPassword 
      } 
    });
    
    return { message: 'Usuário registrado com sucesso' };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;

    // 👈 Busca o usuário. O Prisma já traz todos os campos mapeados, não precisa de .select('+password')
    const user = await this.prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 👈 Adaptação do Mongo (_id) para o Prisma (id)
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}