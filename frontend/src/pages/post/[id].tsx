import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import Layout from "../../components/Layout";
import PostFuncButtons from "../../components/PostFuncButtons";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPost } from "../../utils/useGetPost";

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const [{ data, error, fetching }] = useGetPost();
  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <div>could not find post</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <Heading mb={4}>{data?.post.title}</Heading>
      <Box mb={4}>{data?.post?.text}</Box>
      <PostFuncButtons id={data.post.id} creatorId={data.post.creator.id} />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
