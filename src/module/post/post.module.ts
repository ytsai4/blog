import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './post.service';
import { ProductController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../common/entities/post.entity';
import { CategoryEntity } from '@src/modules/category/entities/category.entity';
import { CategoryOrderEntity } from '@src/modules/category/entities/category_order.entity';
import { ProductCategoryEntity } from './entities/post-tag.entity';
import { CategoryService } from '../category/category.service';
import { StoreEntity } from '../store/entities/store.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductEntity,
            ProductCategoryEntity,
            CategoryEntity,
            CategoryOrderEntity,
            StoreEntity,
        ]),
    ],
    controllers: [ProductController],
    providers: [ProductService, CategoryService],
    exports: [ProductService, CategoryService],
})
export class ProductModule {}
