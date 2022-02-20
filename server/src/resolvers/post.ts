import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "./../entities/Post";
import { isAuth } from "../middleware/isAuth"

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
  
}


@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number) : Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost( 
    @Arg("input") input: PostInput,
    @Ctx() { req }: any
  ): Promise<Post | null> {

    return Post.create({...input, creatorId: req.session.userId}).save();
    // return em.findOne(Post, { id });
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("id") id: number,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title != "undefined") {
      post.title = title;
      await Post.update({id}, {title});
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
  ): Promise<boolean> {
    await Post.delete(id);

    return true;
  }
}
