import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Layer,
  TextInput,
} from "grommet";
import React from "react";
import { useMutation, useQueryClient } from "react-query";
import { Trackr } from "../types";

interface AddUserGoodsProps {
  contract: Trackr;
  account: string;
  setShow(show: boolean): void;
}

const AddUserGoods: React.FC<AddUserGoodsProps> = (props) => {
  const queryClient = useQueryClient();

  const addGoodsMutation = useMutation(
    async (goodsParams: { displayName: string; goodsOwner: string }) => {
      return await (
        await props.contract.createGood(
          goodsParams.displayName,
          goodsParams.goodsOwner
        )
      ).wait();
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries(["user-custody", props.account]);

        props.setShow(false);
      },
    }
  );

  return (
    <Layer full>
      <Box height="large" pad="large" overflow="auto">
        <Heading level="3">Add new Goods</Heading>
        <Form
          onSubmit={({ value }) => {
            const val = value as { displayName: string; goodsOwner: string };
            addGoodsMutation.mutate(val);
          }}
        >
          <FormField
            disabled={addGoodsMutation.isLoading}
            name="displayName"
            htmlFor="textinput-disp-id"
            label="Display Name"
          >
            <TextInput id="textinput-disp-id" name="displayName" />
          </FormField>

          <FormField
            disabled={addGoodsMutation.isLoading}
            name="goodsOwner"
            htmlFor="textinput-owner-id"
            label="Goods Owner"
          >
            <TextInput id="textinput-owner-id" name="goodsOwner" />
          </FormField>

          <Box direction="row" gap="medium">
            <Button
              type="submit"
              primary
              label="Submit"
              disabled={addGoodsMutation.isLoading}
            />
            <Button
              type="reset"
              label="Cancel"
              onClick={() => props.setShow(false)}
              disabled={addGoodsMutation.isLoading}
            />
          </Box>
        </Form>
      </Box>
    </Layer>
  );
};

export default AddUserGoods;
