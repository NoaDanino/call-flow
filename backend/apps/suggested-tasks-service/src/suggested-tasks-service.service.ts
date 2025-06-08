import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, Tag, SuggestedTask } from '@callCenter/database';
import { LoggerService } from '@callCenter/logger';
import { ConfigService } from '@nestjs/config';

type CreateSuggestedTaskResponse = {
  suggestedTask: SuggestedTask;
  warning?: string;
};

@Injectable()
export class SuggestedTaskService {
  constructor(
    @InjectRepository(SuggestedTask)
    private readonly suggestedTaskRepo: Repository<SuggestedTask>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async createSuggestedTask(
    name: string,
    tagIds: string[] = [],
  ): Promise<CreateSuggestedTaskResponse> {
    let warning: string | undefined;

    let tags: Tag[] = [];
    if (tagIds.length) {
      tags = await this.tagRepo.findBy({ id: In(tagIds) });

      if (tags.length !== tagIds.length) {
        const foundIds = tags.map((t) => t.id);
        const missingIds = tagIds.filter((id) => !foundIds.includes(id));

        warning = `Warning: The following tags were not found and will be ignored: ${missingIds.join(', ')}`;
        console.warn(warning);
      }
    }

    const suggested = this.suggestedTaskRepo.create({ name, tags });
    const saved = await this.suggestedTaskRepo.save(suggested);

    return {
      suggestedTask: saved,
      warning,
    };
  }

  async updateSuggestedTaskName(
    id: string,
    newName: string,
  ): Promise<SuggestedTask> {
    const suggested = await this.suggestedTaskRepo.findOne({ where: { id } });
    if (!suggested) throw new NotFoundException('Suggested task not found');

    suggested.name = newName;

    await this.suggestedTaskRepo.save(suggested);
    await this.taskRepo.update({ suggested_task_id: id }, { name: newName });
    return suggested;
  }

  async updateSuggestedTaskTags(
    id: string,
    tagIds: string[],
  ): Promise<{ SuggestedTask; warning?: string }> {
    const suggested = await this.suggestedTaskRepo.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!suggested) throw new NotFoundException('Suggested task not found');

    const foundTags = await this.tagRepo.findBy({ id: In(tagIds) });

    const foundIds = foundTags.map((t) => t.id);
    const missingIds = tagIds.filter((tid) => !foundIds.includes(tid));

    suggested.tags = foundTags;

    const saved = await this.suggestedTaskRepo.save(suggested);

    let warning: string | undefined;
    if (missingIds.length > 0) {
      warning = `Warning: these tag IDs were not found and were ignored: ${missingIds.join(', ')}`;
      console.warn(warning, { missingTagIds: missingIds });
    }

    return { SuggestedTask: saved, warning };
  }

  async deleteSuggestedTask(id: string): Promise<void> {
    const result = await this.suggestedTaskRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Suggested task not found');
  }

  async getAllSuggestedTasks(): Promise<SuggestedTask[]> {
    return this.suggestedTaskRepo.find({ relations: ['tags', 'tasks'] });
  }
}
