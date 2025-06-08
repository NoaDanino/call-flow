import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Call, SuggestedTask } from '../entities';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('tasks')
@Unique(['name', 'call_id'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @IsNotEmpty()
  @Column()
  name: string;

  @Column({ default: 'Open' })
  status: 'Open' | 'In Progress' | 'Completed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Exclude()
  @ManyToOne(() => Call, (call) => call.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'call_id' })
  call: Call;

  @Column()
  call_id: string;

  @Exclude()
  @ManyToOne(() => SuggestedTask, { nullable: true })
  @JoinColumn({ name: 'suggested_task_id' })
  suggestedTask?: SuggestedTask;

  @Column({ nullable: true })
  suggested_task_id?: string;
}
