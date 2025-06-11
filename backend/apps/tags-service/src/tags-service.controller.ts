import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
} from '@nestjs/common';

import { LoggerService } from '@callCenter/logger';

import { TagsService } from './tags-service.service';
import { CreateTagDto } from '@callCenter/common';
import { Roles } from '@callCenter/common';
import { UserRole, Tag } from '@callCenter/database';

@Controller('tags')
export class TagsController {
  private readonly logger: LoggerService;

  constructor(private readonly tagsService: TagsService) {
    this.logger = new LoggerService(TagsService.name);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() data: CreateTagDto) {
    return this.tagsService.create(data.name);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: CreateTagDto) {
    return this.tagsService.update(id, data.name);
  }

  @Get()
  async getAllTags(): Promise<Tag[]> {
    return this.tagsService.getAllTags();
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
