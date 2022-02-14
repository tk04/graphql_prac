import { MikroORM } from "@mikro-orm/core";
import path from "path/posix";

import { Post } from "./entities/Post";

export default {
  migrations: {
    path: path.join(__dirname, "/migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+.*\.[jt]s$/, // regex pattern for the migration files
  },
  dbName: "lireddit",
  debug: true,
  type: "postgresql",
  entities: [Post],
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
