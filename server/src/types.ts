import session from "express-session";
import { Request, Response } from "express";

declare module "express-session" {
  export interface SessionData {
    userId?: number;
  }
}

export type MyContext = {
  req: Request & { session: session.SessionData };
  res: Response;
};
