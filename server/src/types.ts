import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import session from "express-session";
import { Request, Response } from "express";
import { createUserLoader } from "./utils/createUserLoader";

declare module "express-session" {
  export interface SessionData {
    userId?: number;
  }
}

export type MyContext = {
  req: Request & { session: session.SessionData };
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
