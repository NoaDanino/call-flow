import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { SuggestedTaskService } from './suggested-tasks-service.service';
import { SuggestedTask } from '../../../libs/database';
import {
  EditSuggestedTaskNameDto,
  EditSuggestedTaskTagsDto,
  CreateSuggestedTaskDto,
} from '../../../libs/common';
import { Roles } from '../../auth/src/roles.decorator';
import { UserRole } from '../../../libs/database/src/entities/user.entity';

@Controller('suggested-tasks')
export class SuggestedTaskController {
  constructor(private readonly suggestedTaskService: SuggestedTaskService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() dto: CreateSuggestedTaskDto,
  ): Promise<{ suggestedTask: SuggestedTask; warning?: string }> {
    return this.suggestedTaskService.createSuggestedTask(dto.name, dto.tagIds);
  }

  @Roles(UserRole.ADMIN)
  @Put('name/:id')
  async updateName(
    @Param('id') id: string,
    @Body() dto: EditSuggestedTaskNameDto,
  ): Promise<SuggestedTask> {
    return this.suggestedTaskService.updateSuggestedTaskName(id, dto.name);
  }

  @Roles(UserRole.ADMIN)
  @Put('tags/:id')
  async updateTags(
    @Param('id') id: string,
    @Body() dto: EditSuggestedTaskTagsDto,
  ): Promise<{ SuggestedTask; warning?: string }> {
    return this.suggestedTaskService.updateSuggestedTaskTags(id, dto.tags);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.suggestedTaskService.deleteSuggestedTask(id);
    return { message: 'Suggested task deleted' };
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<SuggestedTask[]> {
    return this.suggestedTaskService.getAllSuggestedTasks();
  }
}
