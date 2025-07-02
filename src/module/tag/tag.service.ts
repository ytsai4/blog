import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindManyOptions, FindOptionsWhere, IsNull, MoreThan, Repository } from 'typeorm';
import { TagEntity } from '@src/common/entities/tag.entity';
import { TagDto } from './dto/tag.dto';
import { mapToDto } from '@src/common/utils/mapper';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagEntity)
        private readonly tagRepo: Repository<TagEntity>,
    ) {}

    async getAllTags(): Promise<TagDto[]> {
        const where: FindOptionsWhere<TagEntity> = {
            DeleteDate: IsNull(),
        };
        const queryOptions: FindManyOptions<TagEntity> = {
            where,
            order: {
                CreateDate: 'DESC',
            },
        };

        const tagEntities = await this.tagRepo.find(queryOptions);

        const outputData: TagDto[] = tagEntities.map((tag) => mapToDto(TagDto, tag));

        return outputData;
    }
    async getByUUID(UUID: string): Promise<TagDto> {
        const tagEntity = await this.tagRepo.findOne({
            where: {
                DeleteDate: IsNull(),
                UUID,
            },
        });
        const outputData: TagDto = mapToDto(TagDto, tagEntity);

        return outputData;
    }

    /**
     * 新增標籤
     * @param body
     */
    async create(body: CreateTagDto): Promise<TagDto> {
        const { TagName, ...rest } = body;
        const duplicate = await this.tagRepo.findOne({ where: { TagName } });
        if (duplicate) {
            throw new HttpException(`標籤已存在`, HttpStatus.CONFLICT);
        }

        const tag = this.tagRepo.create({ ...body });
        const result = await this.tagRepo.save(tag);
        const outputData: TagDto = mapToDto(TagDto, result);
        return outputData;
    }
}
