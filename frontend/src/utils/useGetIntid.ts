import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetIntid = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  return intId;
};
