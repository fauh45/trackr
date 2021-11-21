import { BigNumberish } from "@ethersproject/bignumber";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Layer,
  Text,
  ThemeContext,
  Tip,
} from "grommet";
import { FormClose } from "grommet-icons";
import React from "react";
import { useQuery } from "react-query";
import { Trackr } from "../types";

interface CustodyListRowProps {
  contract: Trackr;
  isCurrent: boolean;
  toAddress: string;
  reason: string;
}

const CustodyListRow: React.FC<CustodyListRowProps> = (props) => {
  const userQuery = useQuery(["user", props.toAddress], async () => {
    return await props.contract.getUser(props.toAddress);
  });

  return (
    <ThemeContext.Extend
      value={{
        card: {
          hover: {
            container: {
              elevation: "large",
            },
          },
          container: {
            elevation: "medium",
          },
          footer: {
            pad: { horizontal: "medium", vertical: "small" },
            background: "#00000008",
          },
        },
      }}
    >
      <Card flex={false}>
        <CardBody flex={false} pad="small">
          <Text>{props.reason}</Text>
        </CardBody>

        <CardFooter flex={false} pad="small" background={{ color: "light-6" }}>
          {userQuery.isLoading ? (
            <Text>Loading user...</Text>
          ) : (
            <Text>
              {props.isCurrent ? "Currently on" : "Change hands to"}{" "}
              <Tip content={props.toAddress}>
                <b>{userQuery.data?.display_name}</b>
              </Tip>
            </Text>
          )}
        </CardFooter>
      </Card>
    </ThemeContext.Extend>
  );
};

interface CustodyListProps {
  contract: Trackr;
  goodsId: BigNumberish;
  currCustody: string;
  setShow(show: boolean): void;
}

const CustodyList: React.FC<CustodyListProps> = (props) => {
  const goodsChangeHandsQuery = useQuery(
    ["goods-change-hands", props.goodsId],
    async () => {
      return await props.contract.queryFilter(
        props.contract.filters.ItemChangeHands(props.goodsId)
      );
    }
  );

  return (
    <Layer
      onEsc={() => props.setShow(false)}
      onClickOutside={() => props.setShow(false)}
    >
      <Box
        pad="medium"
        gap="small"
        align="center"
        width={{ min: "medium" }}
        height={{ min: "medium" }}
      >
        <Button
          alignSelf="end"
          icon={<FormClose />}
          onClick={() => props.setShow(false)}
        />
        <Heading level="3" margin="none">
          Custody List
        </Heading>

        <Box
          flex
          overflow={{ vertical: "auto" }}
          height={{ min: "0px" }}
          width="medium"
          gap="medium"
          pad={{ horizontal: "medium", vertical: "small" }}
        >
          {goodsChangeHandsQuery.isLoading ? (
            <Text>Loading Custody List...</Text>
          ) : (
            goodsChangeHandsQuery.data
              ?.map((val, i) => (
                <CustodyListRow
                  key={`${props.goodsId.toString()}-${val.args._to.toString()}`}
                  contract={props.contract}
                  isCurrent={
                    val.args._to === props.currCustody &&
                    i === goodsChangeHandsQuery.data.length - 1
                  }
                  reason={val.args._reason}
                  toAddress={val.args._to}
                />
              ))
              .reverse()
          )}
        </Box>
      </Box>
    </Layer>
  );
};

export default CustodyList;
