import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { CallTag, SuggestedTask } from '../entities';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  name: string;

  @OneToMany(() => CallTag, (ct) => ct.tag)
  callTags: CallTag[];

  @ManyToMany(() => SuggestedTask, (suggestedTask) => suggestedTask.tags)
  suggestedTasks: SuggestedTask[];
}
