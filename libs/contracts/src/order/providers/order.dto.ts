export class CreateOrderDto {}
export class CreateOrderResponseDto {}

export class CreateShippingDto {}
export class CreateShippingResponseDto {}

export class ReadOrderResponseDto {}

export class CreateOrderMicroserviceDto extends CreateOrderDto {
  id: number;
}
export class CreateShippingMicroserviceDto extends CreateShippingDto {
  id: number;
}
