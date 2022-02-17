import React from "react";
import { Formik, Form } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  Button,
} from "@chakra-ui/react";
import Wrapper from "../components/Wrapper";
import Inputfield from "../components/InputField";
interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper varient="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => console.log(values)}
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
              Register{" "}
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
