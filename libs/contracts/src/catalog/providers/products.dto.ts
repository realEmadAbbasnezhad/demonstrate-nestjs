import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@InputType()
export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'test product' })
  @Field()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Product name can only contain letters, numbers, and spaces',
  })
  name: string;

  @ApiProperty({ description: 'URL friendly slug', example: 'test-product' })
  @Field()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, alphanumeric, and can include hyphens',
  })
  slug: string;

  @ApiProperty({
    description: 'Product description',
    example: 'This is a test product',
  })
  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Price in smallest currency unit or as a number',
    example: 100000,
  })
  @Field()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Available stock count', example: 10 })
  @Field()
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stockCount: number;

  @ApiProperty({ description: 'Category identifier or name', example: 'dev' })
  @Field()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    type: [String],
    description: 'Tags for the product',
    example: ['dev', 'test'],
  })
  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^(?=.{1,30}$)(?!_)[a-z0-9]+(?:_[a-z0-9]+)*$/, {
    each: true,
    message:
      'Each tag must be 1-30 characters, lowercase, alphanumeric, and can include underscores',
  })
  tags: string[];
}

@InputType()
export class SearchProductDto {
  @ApiPropertyOptional({ description: 'Full text search query' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Category filter' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], description: 'Tag filters' })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'price' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: 'asc',
  })
  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

@ObjectType()
export class SearchProductResponseDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  price: number;

  @Field()
  category: string;

  @Field(() => [String])
  tags: string[];
}

@ObjectType()
export class FindProductResponseDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  stockCount: number;

  @Field()
  category: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;
}

@InputType()
export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name', example: 'test product' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Product name can only contain letters, numbers, and spaces',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL friendly slug',
    example: 'test-product',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, alphanumeric, and can include hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'This is a test product',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Price in smallest currency unit or as a number',
    example: 100000,
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Available stock count', example: 10 })
  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockCount?: number;

  @ApiPropertyOptional({
    description: 'Category identifier or name',
    example: 'dev',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tags for the product',
    example: ['dev', 'test'],
  })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^(?=.{1,30}$)(?!_)[a-z0-9]+(?:_[a-z0-9]+)*$/, {
    each: true,
    message:
      'Each tag must be 1-30 characters, lowercase, alphanumeric, and can include underscores',
  })
  tags?: string[];
}

export type UpdateProductMicroserviceDto = UpdateProductDto & { id: string };
