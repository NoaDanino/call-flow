import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Call } from './call.entity';
import { Tag } from './tag.entity';

@Entity('call_tags')
export class CallTag {
  @PrimaryColumn()
  call_id: string;

  @PrimaryColumn()
  tag_id: string;

  @Exclude()
  @ManyToOne(() => Call, (call) => call.callTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'call_id' })
  call: Call;

  @Exclude()
  @ManyToOne(() => Tag, (tag) => tag.callTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
