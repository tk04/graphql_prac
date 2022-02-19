import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import Inputfield from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper varient="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          console.log(values);
          const response = await login({ options: values });
          if (response.data.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data.login.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Inputfield
              name="username"
              placeholder="username"
              label="Username"
            />
            <Box mt={4}>
              <Inputfield
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
              color="white"
            >
              {" "}
              Login{" "}
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
