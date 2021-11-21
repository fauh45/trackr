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
import CustodyList from "./CustodyList";

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
  const [showCustodyList, setShowCustodyList] = React.useState(false);
  const [receiverAddress, setReceiverAddress] = React.useState("");

  const goodsQuery = useQuery(["goods", props.goodsId], async () => {
    return await props.contract.getGoods(props.goodsId);
  });

  const ownerQuery = useQuery(
    ["user", goodsQuery.data?.owner],
    async () => {
      return await props.contract.getUser(goodsQuery.data?.owner!);
    },
    {
      enabled:
        goodsQuery.isSuccess &&
        goodsQuery.data.owner !== undefined &&
        goodsQuery.data.owner !== null,
    }
  );

  const currCustodyQuery = useQuery(
    ["user", goodsQuery.data?.currentCustody],
    async () => {
      return await props.contract.getUser(goodsQuery.data?.currentCustody!);
    },
    {
      enabled:
        goodsQuery.isSuccess &&
        goodsQuery.data.currentCustody !== undefined &&
        goodsQuery.data.currentCustody !== null,
    }
  );

  const transferCustodyMutation = useMutation(
    async (to: string) => {
      return await (await props.contract.moveCustody(props.goodsId, to)).wait();
    },
    {
      onSuccess: async () => {
        queryClient.resetQueries(["user-custody", props.account]);
        queryClient.resetQueries(["goods-change-hands", props.goodsId]);

        setReceiverAddress("");
      },
    }
  );

  const lockMutation = useMutation(
    async (lock: boolean) => {
      return await (await props.contract.lockGoods(props.goodsId, lock)).wait();
    },
    {
      onSuccess: async (data) => {
        queryClient.resetQueries(["goods", props.goodsId]);

        setReceiverAddress("");
      },
    }
  );

  return (
    <Card height="fit">
      {showCustodyList && goodsQuery.isSuccess && (
        <CustodyList
          contract={props.contract}
          currCustody={goodsQuery.data.currentCustody}
          goodsId={props.goodsId}
          setShow={setShowCustodyList}
        />
      )}

      <CardBody pad="small">
        {goodsQuery.isLoading ? (
          <Heading level="3">Loading...</Heading>
        ) : (
          <Box gap="medium" align="center" direction="row" pad="small">
            <Box pad={{ right: "medium" }}>
              <Heading level="3">#{props.goodsId.toString()}</Heading>
            </Box>

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
                  <Tip content={goodsQuery.data?.owner || ""}>
                    {ownerQuery.data?.display_name || "Unknown"}
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
                  <Tip content={goodsQuery.data?.currentCustody || ""}>
                    {currCustodyQuery.data?.display_name || "Unknown"}
                  </Tip>
                )}
              </Text>
            </Box>

            <Box align="center">
              <Button
                primary
                label="Custody List"
                disabled={!goodsQuery.isSuccess}
                onClick={() => setShowCustodyList(true)}
              />
            </Box>

            {props.lockable && (
              <Box align="center">
                <Button
                  label={
                    goodsQuery.data?.locked ? "Unlock Goods" : "Lock Goods"
                  }
                  onClick={() => lockMutation.mutate(!goodsQuery.data?.locked)}
                  disabled={goodsQuery.isLoading || lockMutation.isLoading}
                />
              </Box>
            )}

            {props.transferable && (
              <Box align="center">
                {showTransferInput ? (
                  <Box overflow="auto" gap="small">
                    <Box direction="row" gap="small" pad="xxsmall">
                      <Button
                        label="Cancel"
                        onClick={() => setShowTransferInput(false)}
                        disabled={transferCustodyMutation.isLoading}
                      />
                      <Button
                        label="Submit"
                        primary
                        disabled={transferCustodyMutation.isLoading}
                        onClick={() =>
                          transferCustodyMutation.mutate(receiverAddress)
                        }
                      />
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
                    alignSelf="center"
                    label={
                      goodsQuery.data?.locked
                        ? "Goods are locked"
                        : "Transfer Custody"
                    }
                    disabled={goodsQuery.data?.locked}
                    onClick={() => setShowTransferInput(true)}
                  />
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
