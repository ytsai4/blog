import { CommentDto } from '@src/module/comment/dto/comment.dto';
import { PostDto } from '../dto/post.dto';

export interface PostWithLikes extends PostDto {
    Likes: number;
}
export interface PostWithComments extends PostWithLikes {
    Comments: CommentDto[];
}
