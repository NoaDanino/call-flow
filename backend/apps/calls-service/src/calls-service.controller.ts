import {
  Controller,
  Post,
  Param,
  Body,
  Put,
  Get,
  Delete,
} from '@nestjs/common';
import { CallsService } from './calls-service.service';
import { Roles } from '../../auth/src/roles.decorator';
import { UserRole } from '../../../libs/database/src/entities/user.entity';
import { log } from 'winston';

@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Roles(UserRole.USER)
  @Post()
  createCall(@Body('name') name: string) {
    return this.callsService.createCall(name);
  }

  @Roles(UserRole.USER)
  @Put(':id')
  editCallName(@Param('id') id: string, @Body('name') name: string) {
    return this.callsService.editCallName(id, name);
  }

  @Roles(UserRole.USER)
  @Post('add-tag')
  addTagToCall(@Body() body: { callId: string; tagId: string }) {
    const { callId, tagId } = body;
    console.log(callId, tagId);

    return this.callsService.addTagToCall(callId, tagId);
  }

  @Roles(UserRole.USER)
  @Delete('delete-call-tag')
  deleteCallTag(@Body() body: { callId: string; tagId: string }) {
    const { callId, tagId } = body;
    console.log(callId, tagId);

    return this.callsService.removeTagFromCall(callId, tagId);
  }

  @Roles(UserRole.USER)
  @Post('add-task')
  addTaskToCall(@Body() body: { callId: string; taskId: string }) {
    const { callId, taskId } = body;
    return this.callsService.addTaskToCall(callId, taskId);
  }

  @Roles(UserRole.USER)
  @Get()
  getAllCalls() {
    return this.callsService.getAllCalls();
  }

  @Roles(UserRole.USER)
  @Get('suggested-tasks/:id')
  getSuggestedTasksByCallId(@Param('id') callId: string) {
    console.log('get suggested task by call Id', { callId });
    return this.callsService.getSuggestedTasksByCallId(callId);
  }

  @Roles(UserRole.USER)
  @Get('tags/:id')
  getTagsForCall(@Param('id') callId: string) {
    return this.callsService.getTagsForCall(callId);
  }
}
