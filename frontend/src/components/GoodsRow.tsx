import { BigNumberish } from "@ethersproject/bignumber";
import {
  Box,
  Card,
  Text,
  CardBody,
  Heading,
  Tip,
  Button,
  TextInput,
} from "grommet";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Trackr } from "../types";

interface GoodsRowProps {
  goodsId: BigNumberish;
  account: string;
  contract: Trackr;
  transferable?: boolean;
  lockable?: boolean;
}

const GoodsRow: React.FC<GoodsRowProps> = (props) => {
  const queryClient = useQueryClient();

  const [showTransferInput, setShowTransferInput] = React.useState(false);
  const [receiverAddress, setReceiverAddress] = React.useState("");

  const goodsQuery = useQuery(["goods", props.goodsId], async () => {
    return await props.contract.getGoods(props.goodsId);
  });

  const ownerQuery = useQuery(
    ["user", goodsQuery.data?.owner],
    async () => {
      return await props.contract.getUser(goodsQuery.data?.owner!);
    },
    { enabled: !!goodsQuery.isSuccess && goodsQuery.data.exist }
  );

  const currCustodyQuery = useQuery(
    ["user", goodsQuery.data?.currentCustody],
    async () => {
      return await props.contract.getUser(goodsQuery.data?.currentCustody!);
    },
    { enabled: !!goodsQuery.isSuccess && goodsQuery.data.exist }
  );

  const transferCustodyMutation = useMutation(
    async (to: string) => {
      return await props.contract.moveCustody(props.goodsId, to);
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries(["user-custody", props.account]);

        setReceiverAddress("");
      },
    }
  );

  return (
    <Card>
      <CardBody pad="small">
        {goodsQuery.isLoading ? (
          <Heading level="3">Loading...</Heading>
        ) : (
          <Box gap="medium" align="center" direction="row" pad="small">
            <Box>
              <Text weight="bold">Goods Name</Text>
              <Text>{goodsQuery.data?.displayName}</Text>
            </Box>

            <Box>
              <Text weight="bold">Goods Owner</Text>
              <Text>
                {ownerQuery.isLoading ? (
                  "Loading owner..."
                ) : (
                  <Tip content={goodsQuery.data?.owner}>
                    {ownerQuery.data?.display_name}
                  </Tip>
                )}
              </Text>
            </Box>

            <Box>
              <Text weight="bold">Current Custody</Text>
              <Text>
                {currCustodyQuery.isLoading ? (
                  "Loading custody..."
                ) : (
                  <Tip content={goodsQuery.data?.currentCustody}>
                    {currCustodyQuery.data?.display_name}
                  </Tip>
                )}
              </Text>
            </Box>

            {props.transferable && (
              <Box alignSelf="end">
                {showTransferInput ? (
                  <Box overflow="auto" gap="small">
                    <Box direction="row" gap="small" height="xxsmall">
                      <Button
                        onClick={() => setShowTransferInput(false)}
                        disabled={transferCustodyMutation.isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={transferCustodyMutation.isLoading}
                        onClick={() =>
                          transferCustodyMutation.mutate(receiverAddress)
                        }
                      >
                        Submit
                      </Button>
                    </Box>

                    <TextInput
                      placeholder="Receiver address"
                      disabled={transferCustodyMutation.isLoading}
                      value={receiverAddress}
                      onChange={(ev) => setReceiverAddress(ev.target.value)}
                    />
                  </Box>
                ) : (
                  <Button
                    disabled={goodsQuery.data?.locked}
                    onClick={() => setShowTransferInput(true)}
                  >
                    {goodsQuery.data?.locked ? (
                      <Tip content="Goods are locked">Transfer Custody</Tip>
                    ) : (
                      "Transfer Custody"
                    )}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

GoodsRow.defaultProps = {
  transferable: false,
  lockable: false,
};

export default GoodsRow;
