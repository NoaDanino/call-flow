// suggested-task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Tag, Task } from '../../../database';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity('suggested_tasks')
export class SuggestedTask {
  @PrimaryGeneratedColumn('uuid') id: string;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'suggested_task_tags',
    joinColumn: { name: 'suggested_task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // @OneToMany(() => SuggestedTaskTag, (stt) => stt.suggestedTask)
  // suggestedTaskTags: SuggestedTaskTag[];

  @OneToMany(() => Task, (task) => task.suggestedTask)
  tasks: Task[];
}
