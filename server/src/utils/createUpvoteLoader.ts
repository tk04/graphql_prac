import { Upvote } from "./../entities/Upvote";
import DataLoader from "dataloader";

export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const upvote = await Upvote.findByIds(keys as any);
      const upvoteIdsToUpvote: Record<string, Upvote> = {};
      upvote.forEach((upvote) => {
        upvoteIdsToUpvote[`${upvote.userId}${upvote.postId}`] = upvote;
      });
      console.log("upvoteIdsToUpvote", upvoteIdsToUpvote);
      return keys.map((key) => upvoteIdsToUpvote[`${key.userId}${key.postId}`]);
    }
  );
