import Navbar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <div>Hello world</div>
      <br />
      {data && data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
