import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();
  const post = orm.em.create(Post, { title: "Hello World" });
  await orm.em.persistAndFlush(post);
};
main();
