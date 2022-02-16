import session from "express-session";
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";

declare module "express-session" {
  export interface SessionData {
    userId?: number;
  }
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: session.SessionData };
  res: Response;
};
