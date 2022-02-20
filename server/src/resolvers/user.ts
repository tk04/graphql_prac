import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from "type-graphql";
import { getConnection } from "typeorm";
import { User } from "../entities/User";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { MyContext } from "./../types";
import { validRegister } from "./../utils/validRegister";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}
@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return  User.findOne(req.session.userId);
    
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);

    // const user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    //   email: options.email,
    // });
    let user;
    try {
      const result = await getConnection().createQueryBuilder().insert().into(User).values({      
        username: options.username,
        password: hashedPassword,
        email: options.email
      }).returning("*").execute();    
      user = result.raw[0];
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
      console.log("message: ", error.messsage);
    }
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ?  {email: usernameOrEmail }
        : {username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [{ field: "usernameOrEmail", message: "username not found" }],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "Incorrect password" }],
      };
    }
    req.session.userId = user.id;

    return { user };
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
