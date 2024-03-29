import { User } from "./../entities/User";
import { getConnection } from "typeorm";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "./../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import { Upvote } from "../entities/Upvote";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(
    @Root() post: Post,
    @Ctx() { userLoader }: MyContext
  ): Promise<User> | null {
    return userLoader.load(post.creatorId);
  }
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return upvote ? upvote.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId;
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const upvote = await Upvote.findOne({ where: { postId, userId } });
    if (upvote && upvote.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `    
        update upvote
        set value = $1
        where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        await tm.query(`   
        update post 
        set points = points + ${2 * realValue}
        where id = ${postId};`);
      });
    } else if (!upvote) {
      await getConnection().transaction(async (tm) => {
        await tm.query(`    
        insert into upvote ("userId", "postId", value)
        values (${userId}, ${postId}, ${realValue});`);

        await tm.query(`   
        update post 
        set points = points + ${realValue}
        where id = ${postId};`);
      });
    }

    // await Upvote.insert({ userId, postId, value: realValue });

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit) + 1;

    const replacements: any[] = [realLimit];
    console.log("USER SESSION", req.headers);

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const posts = await getConnection().query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    // console.log(post);

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .where("")
    //   .orderBy('p."createdAt"', "DESC")
    //   .take(realLimit);
    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }
    // const posts = await qb.getMany();

    return {
      posts: posts.slice(0, realLimit - 1),
      hasMore: posts.length === realLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: any
  ): Promise<Post | null> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
    // return em.findOne(Post, { id });
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ text, title })
      .where('id = :id and "creatorId" = :creatorId ', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();
    return result.raw[0];
    // return Post.update({ id, creatorId: req.session.userId }, { title, text });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // } else if (post.creatorId !== req.session.userId) {
    //   throw new Error("Not authorized");
    // }
    // await Upvote.delete({ postId: id });
    await Post.delete({ id, creatorId: req.session.userId });

    return true;
  }
}
