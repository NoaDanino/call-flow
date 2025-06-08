import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleErrorThrow } from '@callCenter/utils';
import { LoggerService } from '@callCenter/logger';
import { ConfigService } from '@nestjs/config';

import { Call, Tag, Task, CallTag, SuggestedTask } from '@callCenter/database';

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(CallTag)
    private readonly callTagRepository: Repository<CallTag>,
    @InjectRepository(SuggestedTask)
    private readonly suggestedTaskRepository: Repository<SuggestedTask>,

    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async createCall(title: string): Promise<Call> {
    this.logger.info('Creating call', { title });

    try {
      const call = this.callRepository.create({ title });
      const saved = await this.callRepository.save(call);

      this.logger.debug('Call created', { id: saved.id, title });
      return saved;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to create call', { title, error });
    }
  }

  async editCallName(id: string, newName: string): Promise<Call> {
    this.logger.info('Editing call name', { id, newName });

    try {
      const call = await this.callRepository.findOne({ where: { id } });
      if (!call) {
        this.logger.warn('Call not found', { id });
        throw new NotFoundException('Call not found');
      }

      call.title = newName;
      const saved = await this.callRepository.save(call);

      this.logger.debug('Call name updated', { id, newName });
      return saved;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to edit call name', {
        id,
        newName,
        error,
      });
    }
  }

  async addTagToCall(callId: string, tagId: string): Promise<CallTag> {
    this.logger.info('Adding tag to call', { callId, tagId });

    try {
      const call = await this.callRepository.findOne({ where: { id: callId } });
      if (!call) throw new NotFoundException('Call not found');

      const tag = await this.tagRepository.findOne({ where: { id: tagId } });
      if (!tag) throw new NotFoundException('Tag not found');

      const existing = await this.callTagRepository.findOne({
        where: { call: { id: callId }, tag: { id: tagId } },
      });

      if (existing) {
        this.logger.warn('Tag already associated with call', { callId, tagId });
        return existing;
      }

      const callTag = this.callTagRepository.create({ call, tag });
      const saved = await this.callTagRepository.save(callTag);

      this.logger.debug('Tag added to call', { callId, tagId });
      return saved;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to add tag to call', {
        callId,
        tagId,
        error,
      });
    }
  }

  async removeTagFromCall(callId: string, tagId: string): Promise<void> {
    this.logger.info('Removing tag from call', { callId, tagId });

    try {
      const callTag = await this.callTagRepository.findOne({
        where: { call: { id: callId }, tag: { id: tagId } },
      });

      if (!callTag) {
        this.logger.warn('Tag relation not found for call', { callId, tagId });
        throw new NotFoundException('Tag relation not found for this call');
      }

      await this.callTagRepository.remove(callTag);
      this.logger.debug('Tag removed from call', { callId, tagId });
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to remove tag from call', {
        callId,
        tagId,
        error,
      });
    }
  }

  async getTagsForCall(callId: string): Promise<Tag[]> {
    this.logger.info('Fetching tags for call', { callId });

    try {
      const call = await this.callRepository.findOne({
        where: { id: callId },
        relations: ['callTags', 'callTags.tag'],
      });

      if (!call) throw new NotFoundException('Call not found');

      const tags = call.callTags.map((ct) => ct.tag);
      this.logger.debug('Tags fetched for call', {
        callId,
        count: tags.length,
      });
      return tags;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to get tags for call', {
        callId,
        error,
      });
    }
  }

  async addTaskToCall(callId: string, taskId: string): Promise<Task> {
    this.logger.info('Adding task to call', { callId, taskId });

    try {
      const call = await this.callRepository.findOne({ where: { id: callId } });
      if (!call) throw new NotFoundException('Call not found');

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) throw new NotFoundException('Task not found');

      task.call = call;
      const saved = await this.taskRepository.save(task);

      this.logger.debug('Task added to call', { callId, taskId });
      return saved;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to add task to call', {
        callId,
        taskId,
        error,
      });
    }
  }

  async getAllCalls(): Promise<Call[]> {
    this.logger.info('Fetching all calls');
    try {
      const calls = await this.callRepository.find();
      this.logger.info('Calls fetched', { count: calls.length });
      return calls;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to fetch calls', { error });
    }
  }

  async getSuggestedTasksByCallId(callId: string): Promise<SuggestedTask[]> {
    this.logger.info('Fetching suggested tasks for call', { callId });

    try {
      const call = await this.callRepository.findOne({
        where: { id: callId },
        relations: ['callTags', 'callTags.tag'],
      });

      if (!call) throw new NotFoundException('Call not found');

      const tagIds = call.callTags.map((ct) => ct.tag.id);
      if (!tagIds.length) {
        this.logger.info('No tags on call, no suggestions', { callId });
        return [];
      }

      const suggestedTasks = await this.suggestedTaskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.tags', 'tag')
        .where('tag.id IN (:...tagIds)', { tagIds })
        .getMany();

      this.logger.debug('Suggested tasks fetched', {
        callId,
        count: suggestedTasks.length,
      });

      return suggestedTasks;
    } catch (error) {
      handleErrorThrow(this.logger, 'Failed to get suggested tasks', {
        callId,
        error,
      });
    }
  }
}
