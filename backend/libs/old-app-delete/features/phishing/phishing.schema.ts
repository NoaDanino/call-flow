import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'phishingAttempts', timestamps: { createdAt: 'sentAt' } })
export class PhishingAttempt extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ default: false })
  clicked: boolean;

  @Prop()
  clickedAt?: Date;

  @Prop()
  link?: string;
}

export const PhishingAttemptSchema =
  SchemaFactory.createForClass(PhishingAttempt);
