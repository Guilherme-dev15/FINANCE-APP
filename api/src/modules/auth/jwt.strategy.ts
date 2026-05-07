import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';

// 👈 1. Criamos a interface para substituir o 'any'
export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    console.log('JwtStrategy foi carregado!'); // 🚀 Debug

    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET não está definido no arquivo .env'); 
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret, 
    });
  }

  // 👈 2. Removemos o 'async' e tipamos o payload
  validate(payload: JwtPayload) {
    console.log('Payload recebido no JwtStrategy:', payload); // 🚀 Debug
    
    if (!payload?.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    
    return { userId: payload.sub, email: payload.email };
  }
}