import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CustomerLeadsModule } from '../customer-leads/customer-leads.module';
import { EmployeesModule } from '../employees/employees.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({}),
    JwtModule.register({
      signOptions: {
        expiresIn: `${2 * 60 * 60}s`,
      },
    }),
    CustomerLeadsModule,
    EmployeesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
