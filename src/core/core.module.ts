import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BearerTokenStrategy } from './strategies/bearer-token.strategy';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [BearerTokenStrategy],
})
export class CoreModule {}
