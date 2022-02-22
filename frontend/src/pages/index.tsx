import Navbar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ChevronUpIcon } from "@chakra-ui/icons";
import { ChevronDownIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useState } from "react";
import Upvotesection from "../components/UpvoteSection";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables: variables });
  console.log(fetching);
  if (!fetching && !data) {
    return <div>Your query failed</div>;
  }
  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create Post</Link>
        </NextLink>
      </Flex>
      <br />
      {data && (
        <Stack spacing={8}>
          {data.posts.posts.map((p) => (
            // <div key={p.id}>{p.title}</div>
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <Upvotesection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text>posted by {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet.slice(0, 50)}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
