import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, Call, SuggestedTask } from '../../../libs/database';
import { TaskStatus } from 'libs/common';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(Call)
    private callRepo: Repository<Call>,
    @InjectRepository(SuggestedTask)
    private suggestedTaskRepo: Repository<SuggestedTask>,
  ) {}

  // async addTaskToCall(callId: string, name: string): Promise<Task> {
  //   const call = await this.callRepo.findOne({ where: { id: callId } });

  //   if (!call) throw new NotFoundException('Call not found');

  //   const task = this.taskRepo.create({ name, call, status: 'Open' });
  //   return this.taskRepo.save(task);
  // }

  async addTaskToCall(
    callId: string,
    suggestedTaskId?: string,
    name?: string,
  ): Promise<Task> {
    console.log('hiiiiiiiiiiiiiiiiiii', callId, suggestedTaskId, name);

    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');

    let taskName = name;
    let suggestedTask: SuggestedTask | undefined;

    if (suggestedTaskId) {
      const foundSuggestedTask = await this.suggestedTaskRepo.findOne({
        where: { id: suggestedTaskId },
      });
      if (!foundSuggestedTask)
        throw new NotFoundException('Suggested Task not found');
      suggestedTask = foundSuggestedTask;
      taskName = suggestedTask.name;
    }
    if (!taskName) {
      throw new BadRequestException(
        'Either a name or a suggestedTaskId must be provided',
      );
    }

    const task = this.taskRepo.create({
      name: taskName,
      call,
      status: 'Open',
      suggestedTask: suggestedTask,
    });

    return this.taskRepo.save(task);
  }

  async editTaskName(taskId: string, name: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      select: ['id', 'name', 'suggested_task_id'], // load suggested_task_id
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Guard: if this task was created from a SuggestedTask, disallow renaming
    if (task.suggested_task_id) {
      throw new BadRequestException(
        'Cannot change the name of a task derived from a suggested template',
      );
    }

    // Otherwise, update
    task.name = name;
    return this.taskRepo.save(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskRepo.delete(taskId);
    if (result.affected === 0) throw new NotFoundException('Task not found');
  }

  async editTaskStatus(
    taskId: string,
    status: TaskStatus,
    //TODO: add enum for status
  ): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });

    if (!task) throw new NotFoundException('Task not found');
    task.status = status;
    return this.taskRepo.save(task);
  }

  async getTasksByCall(callId: string): Promise<Task[]> {
    const tasks = await this.taskRepo.find({
      where: { call: { id: callId } },
      // relations: ['call', 'suggestedTask'], // include related entities if needed
    });

    if (!tasks.length) {
      return [];
      // throw new NotFoundException('No tasks found for this call');
    }

    return tasks;
  }

  // async addSuggestedTaskToCall(
  //   callId: string,
  //   suggestedTaskId: string,
  // ): Promise<Task> {
  //   const call = await this.callRepo.findOne({ where: { id: callId } });

  //   if (!call) throw new NotFoundException('Call not found');

  //   const suggestedTask = await this.suggestedTaskRepo.findOne({
  //     where: { id: suggestedTaskId },
  //   });

  //   if (!suggestedTask) throw new NotFoundException('Suggested task not found');

  //   const task = this.taskRepo.create({
  //     name: suggestedTask.name,
  //     status: suggestedTask.status,
  //     call,
  //     suggestedTask,
  //   });

  //   return this.taskRepo.save(task);
  // }
}
