import { ClassConstructor, plainToInstance } from 'class-transformer';

export function mapToDto<T, V>(dtoClass: ClassConstructor<T>, entity: V): T {
    return plainToInstance(dtoClass, entity, { excludeExtraneousValues: true });
}
