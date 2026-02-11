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

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'test product' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Product name can only contain letters, numbers, and spaces',
  })
  name: string;

  @ApiProperty({ description: 'URL friendly slug', example: 'test-product' })
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
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Price in smallest currency unit or as a number',
    example: 100000,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Available stock count', example: 10 })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stockCount: number;

  @ApiProperty({ description: 'Category identifier or name', example: 'dev' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    type: [String],
    description: 'Tags for the product',
    example: ['dev', 'test'],
  })
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

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}
export class SearchProductDto {
  @ApiPropertyOptional({ description: 'Full text search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], description: 'Tag filters' })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'price' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
export class SearchProductResponseDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  tags: string[];
}

export class FindProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockCount: number;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name', example: 'test product' })
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
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Price in smallest currency unit or as a number',
    example: 100000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Available stock count', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockCount?: number;

  @ApiPropertyOptional({
    description: 'Category identifier or name',
    example: 'dev',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tags for the product',
    example: ['dev', 'test'],
  })
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
