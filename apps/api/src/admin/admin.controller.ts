import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '@rentnear/types';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('listings')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getListings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getListings(page, limit);
  }

  // Temporary endpoint to grant oneself admin rights for testing
  @Post('promote-me')
  async promoteMe(@CurrentUser() user: JwtPayload) {
    await this.adminService.promoteToAdmin(user.sub);
    return {
      success: true,
      message:
        'You have been promoted to ADMIN. Please log out and log back in to get a fresh JWT.',
    };
  }

  @Get('disputes')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getDisputes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getDisputes(page, limit);
  }

  @Patch('disputes/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateDispute(@Param('id') id: string, @Body() data: { status: string; adminNotes?: string }) {
    return this.adminService.updateDispute(id, data);
  }
}
