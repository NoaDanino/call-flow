import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TaskStatus } from '../enums';

export class EditTaskNameDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class EditTaskStatusDto {
  @IsEnum(TaskStatus, {
    message: 'status must be one of Open, In Progress, Completed',
  })
  status: TaskStatus;
}
