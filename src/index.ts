import { MyContext } from "src/types";
import { UserResolver } from "./resolvers/user";
import "reflect-metadata";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { HelloResolver } from "./resolvers/hello";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

// import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = createClient();
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
        sameSite: "none",
        secure: true, // only works in https
      },
      saveUninitialized: false,
      secret: "kjhasdfkajhdfkajhdkjahdfkjadkfhb",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(4000);
};
main();
