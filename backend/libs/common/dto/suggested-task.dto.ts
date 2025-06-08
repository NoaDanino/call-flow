import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ArrayUnique,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class EditSuggestedTaskNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class EditSuggestedTaskTagsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  tags: string[];
}

export class CreateSuggestedTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];
}
