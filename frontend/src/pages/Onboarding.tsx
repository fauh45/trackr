import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import {
  Box,
  Card,
  CardFooter,
  Heading,
  Text,
  TextInput,
  Button,
} from "grommet";
import { Basket, Cpu } from "grommet-icons";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Trackr__factory } from "../types/factories/Trackr__factory";
import { Navigate, useNavigate } from "react-router-dom";

interface IdentifierProps {
  title: string;
  subTitle: string;
  size: string;
}

const Identifier: React.FC<IdentifierProps> = ({
  children,
  title,
  subTitle,
  size,
}) => (
  <Box gap="small" align="center" direction="row" pad="small">
    {children}
    <Box>
      <Text size={size} weight="bold">
        {title}
      </Text>
      <Text size={size}>{subTitle}</Text>
    </Box>
  </Box>
);

interface OnboardingProps {}

const Onboarding: React.FC<OnboardingProps> = (props) => {
  const { active, library, account } = useWeb3React<Web3Provider>();

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

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [type, setType] = React.useState<"Manufacturer" | "Customer">();
  const [displayName, setDisplayName] = React.useState<string>();

  const userMutation = useMutation(
    async (userData: {
      type: "Manufacturer" | "Customer";
      displayName: string;
    }) => {
      if (userData.type === "Customer") {
        await trackrContract.registerAsCustomer(userData.displayName);
      } else {
        await trackrContract.registerAsManufacturer(userData.displayName);
      }

      return;
    },
    {
      onSuccess: async () => {
        await queryClient.resetQueries(["user", account]);

        navigate("/", { replace: true });
      },
    }
  );

  if (!active) return <Navigate to="/" replace />;
  else if (userQuery.isSuccess && userQuery.data.exist)
    return <Navigate to="/" replace />;

  return (
    <Box pad="large">
      <Box align="center">
        <Heading level="1" margin="none">
          Welcome!
        </Heading>

        <Heading level="3" color="dark-6">
          Let's get to know you first
        </Heading>
      </Box>

      <Box align="center" direction="column" pad="medium" gap="medium">
        <Card
          width="medium"
          onClick={() => setType("Manufacturer")}
          background={{
            color: type === "Manufacturer" ? "light-3" : undefined,
          }}
        >
          <CardFooter pad="small">
            <Identifier
              title="Manufacturer"
              subTitle="User that creates goods"
              size="big"
            >
              <Cpu size="large" />
            </Identifier>
          </CardFooter>
        </Card>

        <Card
          width="medium"
          onClick={() => setType("Customer")}
          background={{
            color: type === "Customer" ? "light-3" : undefined,
          }}
        >
          <CardFooter pad="small">
            <Identifier
              title="Customer"
              subTitle="User that receive and use goods"
              size="big"
            >
              <Basket size="large" />
            </Identifier>
          </CardFooter>
        </Card>

        {!type ? (
          <Text color="dark-6">What kind of user are you?</Text>
        ) : (
          <Box width="medium" gap="medium">
            <Text color="dark-6">
              Your display name could be anything, it will be shown in the app.
            </Text>

            <TextInput
              disabled={userMutation.isLoading}
              placeholder="Your display name"
              value={displayName}
              onChange={(ev) => setDisplayName(ev.target.value)}
            />

            {!displayName || displayName.length < 1 ? (
              <Text color="status-error">Display name needed to be longer</Text>
            ) : (
              <>
                <Button
                  disabled={userMutation.isLoading}
                  onClick={() =>
                    userMutation.mutate({
                      type: type,
                      displayName: displayName,
                    })
                  }
                  primary
                  label="Submit"
                />
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Onboarding;
