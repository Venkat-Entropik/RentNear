import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtPayload } from '@rentnear/types';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(user.sub, dto);
  }

  @Get()
  getUserDisputes(@CurrentUser() user: JwtPayload) {
    return this.disputesService.getUserDisputes(user.sub);
  }
}
