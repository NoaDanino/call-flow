import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ArrayUnique,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

// DTO for editing the Suggested Task name
export class EditSuggestedTaskNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// DTO for editing Suggested Task tags
export class EditSuggestedTaskTagsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true }) // each element should be a valid UUID
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
