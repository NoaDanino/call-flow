import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoggerService } from '@callCenter/logger';

import { Repository } from 'typeorm';
import { Tag } from '@callCenter/database';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TagsService {
  private senderEmail: string;
  private senderPass: string;
  private port: number;

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    // this.port = this.configService.get<number>('PORT') || 3000;
  }

  async create(name: string): Promise<Tag> {
    //TODO: check if exist before or catch error? best case
    const tag = this.tagRepository.create({ name });
    return this.tagRepository.save(tag);
  }

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async update(id: string, name: string): Promise<Tag> {
    console.log('Updating tag with ID:', id, name);
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
    tag.name = name;
    return this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['callTags'], //TODO: put relation table name as .env variable
    });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepository.remove(tag);
  }
}
