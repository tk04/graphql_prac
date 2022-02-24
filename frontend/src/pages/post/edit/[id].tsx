import { withUrqlClient } from "next-urql";
import React from "react";
import { createUrqlClient } from "../../../utils/createUrqlClient";

interface EditProps {}

const EditPost: React.FC<EditProps> = ({}) => {
  return <div>hi</div>;
};

export default withUrqlClient(createUrqlClient)(EditPost);
