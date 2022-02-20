import React from "react";
import Navbar from "./NavBar";
import Wrapper from "./Wrapper";

interface LayoutProps {
  varient?: "small" | "regular";
}

const Layout: React.FC<LayoutProps> = ({ children, varient }) => {
  return (
    <>
      <Navbar />
      <Wrapper varient={varient}>{children}</Wrapper>
    </>
  );
};

export default Layout;
