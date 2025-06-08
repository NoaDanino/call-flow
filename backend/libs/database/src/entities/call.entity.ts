import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';
import { CallTag } from './call-tag.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.call)
  tasks: Task[];

  @OneToMany(() => CallTag, (ct) => ct.call)
  callTags: CallTag[];
}
