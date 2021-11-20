import React from "react";
import { Box, Button, Header, Heading, Nav, Text } from "grommet";
import { Trackr__factory } from "../types/factories/Trackr__factory";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { Navigate } from "react-router-dom";
import { useQuery } from "react-query";
import AddUserGoods from "../components/AddUserGoods";

interface MainProps {}

const Main: React.FC<MainProps> = (props) => {
  const { active, library, account } = useWeb3React<Web3Provider>();

  const [addGoodsOpen, setAddGoodsOpen] = React.useState(false);

  const trackrContract = Trackr__factory.connect(
    process.env.REACT_APP_CONTRACT_ADDRESS,
    library?.getSigner()!
  );

  const userQuery = useQuery(
    ["user", account],
    async () => {
      return await trackrContract.getUser(account!);
    },
    { enabled: !!active }
  );
  const userGoodsQuery = useQuery(
    ["user-goods", account],
    async () => {
      return await trackrContract.getUserGoodsList();
    },
    { enabled: !!active }
  );
  const userCustodyQuery = useQuery(
    ["user-custody", account],
    async () => {
      return await trackrContract.getUserCustodyList();
    },
    { enabled: !!active }
  );

  if (!active) return <Navigate to="/" replace />;
  else if (userQuery.data && !userQuery.data.exist)
    return <Navigate to="/onboarding" replace />;

  return (
    <Box>
      <Header background="light-3" pad="small">
        <Heading level="3" margin="none">
          <b>trackr™</b>
        </Heading>
        <Nav direction="row">
          {userQuery.isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <Box pad={{ horizontal: "small" }}>
              <Text>
                <b>{userQuery.data?.display_name}</b>
              </Text>
              <Text color="dark-6">
                {userQuery.data?.user_type === 0 ? "Manufacturer" : "Customer"}
              </Text>
            </Box>
          )}
        </Nav>
      </Header>

      <Box pad="medium">
        {userQuery.isSuccess && userQuery.data.user_type === 0 && (
          <Button label="Add Goods" onClick={() => setAddGoodsOpen(true)} />
        )}

        {addGoodsOpen && (
          <AddUserGoods
            contract={trackrContract}
            account={account!}
            setShow={setAddGoodsOpen}
          />
        )}

        {userGoodsQuery.isSuccess ? (
          userGoodsQuery.data?.map((val) => (
            <Text key={val.toString()}>{val.toString()}</Text>
          ))
        ) : (
          <Text>Loading User Goods...</Text>
        )}

        {userCustodyQuery.isSuccess ? (
          userCustodyQuery.data?.map((val) => (
            <Text key={val.toString()}>{val.toString()}</Text>
          ))
        ) : (
          <Text>Loading User Custody...</Text>
        )}
      </Box>
    </Box>
  );
};

export default Main;
