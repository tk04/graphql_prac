import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const Upvotesection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  const [isLoading, setIsLoading] = useState<
    "not-loading" | "upvote-loading" | "downvote-loading"
  >("not-loading");
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="upvote post"
        isLoading={isLoading === "upvote-loading"}
        onClick={async () => {
          setIsLoading("upvote-loading");
          await vote({ postId: post.id, value: 1 });
          setIsLoading("not-loading");
        }}
      />
      {post.points}
      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downvote post"
        isLoading={isLoading === "downvote-loading"}
        onClick={async () => {
          setIsLoading("downvote-loading");
          vote({ postId: post.id, value: -1 });
          setIsLoading("not-loading");
        }}
      />
    </Flex>
  );
};

export default Upvotesection;
