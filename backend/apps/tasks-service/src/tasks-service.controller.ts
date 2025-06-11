import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Get,
} from '@nestjs/common';
import { TaskService } from './tasks-service.service';
import { EditTaskNameDto, EditTaskStatusDto } from '@callCenter/common';
import { Roles } from '@callCenter/common';
import { UserRole, Task } from '@callCenter/database';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles(UserRole.USER)
  @Post('addTaskByCallId/:callId')
  async addTaskToCall(
    @Param('callId') callId: string,
    @Body('name') name: string,
    @Body('suggestedTaskId') suggestedTagId: string,
  ) {
    return this.taskService.addTaskToCall(callId, suggestedTagId, name);
  }

  @Roles(UserRole.USER)
  @Put('updateTaskName/:taskId')
  async editTaskName(
    @Param('taskId') taskId: string,
    @Body() dto: EditTaskNameDto,
  ) {
    return this.taskService.editTaskName(taskId, dto.name);
  }

  @Roles(UserRole.USER)
  @Delete(':taskId')
  async deleteTask(@Param('taskId') taskId: string) {
    await this.taskService.deleteTask(taskId);
    return { message: 'Task deleted' };
  }

  @Roles(UserRole.USER)
  @Get('callTasks/:callId')
  async getTasksByCall(@Param('callId') callId: string): Promise<Task[]> {
    return this.taskService.getTasksByCall(callId);
  }

  //TODO:add DTO validation - not putting the vars as is
  @Roles(UserRole.USER)
  @Put('/status/:taskId')
  async editTaskStatus(
    @Param('taskId') taskId: string,
    @Body() editTaskStatusDto: EditTaskStatusDto,
  ) {
    const { status } = editTaskStatusDto;

    return this.taskService.editTaskStatus(taskId, status);
  }
}
