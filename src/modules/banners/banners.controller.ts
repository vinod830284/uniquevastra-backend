import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // Public endpoint for Mobile App
  @Get()
  async getActiveBanners(@Query('position') position?: string) {
    const banners = await this.bannersService.findAllActive(position);
    return {
      success: true,
      data: banners,
    };
  }

  // Admin endpoint to view all banners
  @Get('admin')
  async getAllAdminBanners(@Query('position') position?: string) {
    const banners = await this.bannersService.findAllAdmin(position);
    return {
      success: true,
      data: banners,
    };
  }

  @Put('reorder')
  async reorderBanners(@Body() items: { id: string; sortOrder: number }[]) {
    const result = await this.bannersService.reorderBanners(items);
    return result;
  }

  @Get(':id')
  async getBannerById(@Param('id') id: string) {
    const banner = await this.bannersService.findOne(id);
    return {
      success: true,
      data: banner,
    };
  }

  @Post()
  async createBanner(@Body() createBannerDto: CreateBannerDto) {
    const banner = await this.bannersService.create(createBannerDto);
    return {
      success: true,
      data: banner,
      message: 'Banner created successfully',
    };
  }

  @Put(':id')
  async updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto
  ) {
    const banner = await this.bannersService.update(id, updateBannerDto);
    return {
      success: true,
      data: banner,
      message: 'Banner updated successfully',
    };
  }

  @Delete(':id')
  async removeBanner(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }
}
