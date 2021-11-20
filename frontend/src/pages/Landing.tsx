import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Box, Button, Heading, Text } from "grommet";
import React from "react";
import { Navigate } from "react-router-dom";
import { injectedConnector } from "../common/InjectedConnector";

interface LandingProps {}

const Landing: React.FC<LandingProps> = (props) => {
  const { activate, active } = useWeb3React<Web3Provider>();

  if (active) return <Navigate to="/app" replace />;

  return (
    <Box pad="large">
      <Box align="center" pad={{ bottom: "medium" }}>
        <Heading level="1" margin="none">
          trackr™
        </Heading>
        <Heading level="3" color="dark-6">
          Supply Management in the chain!
        </Heading>
      </Box>

      <Box align="center" pad="medium" gap="5px">
        <Button
          primary
          label="Connect"
          onClick={() => activate(injectedConnector)}
        />
        <Text size="small" color="dark-6">
          Connect using brower extensions such as Metamask, etc.
        </Text>
      </Box>
    </Box>
  );
};

export default Landing;
