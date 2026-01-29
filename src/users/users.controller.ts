import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decoretor';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

//  @UseGuards(JwtAuthGuard,Roleuard)
//  @Roles('Admin')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  getCurrentUser(@Req() req: Request) {
    return this.usersService.findCurrentUser(
      (req as any).user.userId,
    );
  }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const { password, ...safeDto } = dto;
    return this.usersService.update(id, safeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
