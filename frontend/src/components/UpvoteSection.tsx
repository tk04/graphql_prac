import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, PostsQuery } from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const Upvotesection: React.FC<UpvoteSectionProps> = ({ post }) => {
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton icon={<ChevronUpIcon />} aria-label="upvote post" />
      {post.points}
      <IconButton icon={<ChevronDownIcon />} aria-label="downvote post" />
    </Flex>
  );
};

export default Upvotesection;
