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
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";
import Upvotesection from "../components/UpvoteSection";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
const Index = () => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
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
      {data && (
        <Stack spacing={8}>
          {data.posts.posts.map((p) =>
            !p ? null : (
              // <div key={p.id}>{p.title}</div>
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <Upvotesection post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {p.creator.username}</Text>
                  <Flex align={"center"}>
                    <Text flex={1} mt={4}>
                      {p.textSnippet}
                    </Text>
                    {meData?.me?.id === p.creator.id && (
                      <Box ml="auto">
                        <NextLink
                          href="/post/edit/[id]"
                          as={`/post/edit/${p.id}`}
                        >
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
                            deletePost({ id: p.id });
                          }}
                        />
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )
          )}
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
