import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCartDto {
  @ApiProperty({
    description: 'ID of the product',
    example: '699701e333f4a3767b5b19fe',
  })
  @Field(() => String, { description: 'ID of the product' })
  @IsString()
  @IsPositive()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @Field(() => Int, { description: 'Quantity of the product' })
  @IsInt()
  @IsPositive()
  quantity: number;
}

@ObjectType()
export class ReadCartResponseDto {
  @ApiProperty({
    description: 'ID of the product',
    example: '699701e333f4a3767b5b19fe',
  })
  @Field(() => String, { description: 'ID of the product' })
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @Field(() => Int, { description: 'Quantity of the product' })
  quantity: number;
}

export class CreateCartMicroserviceDto extends CreateCartDto {
  id: number;
}
