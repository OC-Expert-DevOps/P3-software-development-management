import { IsOptional, IsString, MinLength, MaxLength, IsArray, ArrayMaxSize, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'isUniqueTags', async: false })
export class IsUniqueTagsConstraint implements ValidatorConstraintInterface {
  validate(tags: string[], args: ValidationArguments) {
    if (!tags) return true;
    const uniqueTags = new Set(tags);
    return uniqueTags.size === tags.length;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Tags must be unique';
  }
}

export class UploadFileDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(7)
  expiresInDays?: number = 7;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value.split(',').map(tag => tag.trim());
      }
    }
    return value;
  })
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed' })
  @IsString({ each: true })
  @MaxLength(30, { each: true, message: 'Each tag must be at most 30 characters long' })
  @Validate(IsUniqueTagsConstraint)
  tags?: string[];
}
