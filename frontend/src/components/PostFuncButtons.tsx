import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface PostFuncButtonsProps {
  id: number;
  creatorId;
}

const PostFuncButtons: React.FC<PostFuncButtonsProps> = ({ id, creatorId }) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();
  return (
    <Box>
      {meData?.me?.id === creatorId && (
        <>
          <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
            <IconButton
              as={Link}
              mr={4}
              ml="auto"
              // bg="red"
              // color={"white"}
              icon={<EditIcon />}
              aria-label="edit post"
              // _hover={{ bg: "red.500" }}
            />
          </NextLink>
          <IconButton
            ml="auto"
            // bg="red"
            // color={"white"}
            icon={<DeleteIcon />}
            aria-label="delete post"
            // _hover={{ bg: "red.500" }}
            onClick={() => {
              deletePost({ id: id });
            }}
          />
        </>
      )}
    </Box>
  );
};

export default PostFuncButtons;
