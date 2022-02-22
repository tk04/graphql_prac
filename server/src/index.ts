import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import { createClient } from "redis";
import "reflect-metadata";
import { MyContext } from "src/types";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import path from "path";
import { Upvote } from "./entities/Upvote";
const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post, User, Upvote],
    migrations: [path.join(__dirname, "./migrations/*")],
  });
  await conn.runMigrations();
  // await Post.delete({});

  // const orm = await MikroORM.init(mikroConfig);
  // await orm.getMigrator().up();
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });

  await redisClient.connect();
  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: false, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "hello secret",
      resave: false,
    })
  );
  // app.use(
  //   session({
  //     name: "qid",
  //     store: new RedisStore({
  //       disableTouch: true,
  //       client: redisClient,
  //     }),
  //     cookie: {
  //       maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
  //       httpOnly: true,
  //       sameSite: "lax",
  //       secure: false, // only works in https
  //     },
  //     saveUninitialized: true,
  //     secret: "test",
  //     resave: false,
  //   })
  // );

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: { origin: "http://localhost:3000", credentials: true },
  });
  app.listen(4000);
};
main();
