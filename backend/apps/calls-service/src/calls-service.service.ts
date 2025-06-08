import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Call,
  Tag,
  Task,
  CallTag,
  SuggestedTask,
} from '../../../libs/database';

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(CallTag)
    private readonly callTagRepository: Repository<CallTag>,
    @InjectRepository(SuggestedTask)
    private readonly suggestedTaskRepository: Repository<SuggestedTask>, // <-- Added this
  ) {}

  async createCall(title: string): Promise<Call> {
    const call = this.callRepository.create({ title });
    return this.callRepository.save(call);
  }

  async editCallName(id: string, newName: string): Promise<Call> {
    const call = await this.callRepository.findOne({ where: { id } });
    if (!call) throw new NotFoundException('Call not found');
    call.title = newName;
    return this.callRepository.save(call);
  }

  async addTagToCall(callId: string, tagId: string): Promise<CallTag> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Tag not found');

    const existing = await this.callTagRepository.findOne({
      where: { call: { id: callId }, tag: { id: tagId } },
    });

    if (existing) return existing;

    const callTag = this.callTagRepository.create({ call, tag });
    return this.callTagRepository.save(callTag);
  }

  async addTaskToCall(callId: string, taskId: string): Promise<Task> {
    const call = await this.callRepository.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException('Call not found');

    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    task.call = call;
    return this.taskRepository.save(task);
  }

  async getAllCalls(): Promise<Call[]> {
    return this.callRepository.find();
  }

  async getSuggestedTasksByCallId(callId: string): Promise<SuggestedTask[]> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['callTags', 'callTags.tag'],
    });

    if (!call) throw new NotFoundException('Call not found');

    const tagIds = call.callTags.map((callTag) => callTag.tag.id);

    if (tagIds.length === 0) return []; // no tags => no suggested tasks

    const suggestedTasks = await this.suggestedTaskRepository
      .createQueryBuilder('task')
      .leftJoin('task.tags', 'tag')
      .where('tag.id IN (:...tagIds)', { tagIds })
      .getMany();

    return suggestedTasks;
  }

  async getTagsForCall(callId: string): Promise<Tag[]> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['callTags', 'callTags.tag'],
    });

    if (!call) throw new NotFoundException('Call not found');

    return call.callTags.map((callTag) => callTag.tag);
  }

  async removeTagFromCall(callId: string, tagId: string): Promise<void> {
    const callTag = await this.callTagRepository.findOne({
      where: { call: { id: callId }, tag: { id: tagId } },
    });

    if (!callTag) {
      throw new NotFoundException('Tag relation not found for this call');
    }

    await this.callTagRepository.remove(callTag);
  }
}
