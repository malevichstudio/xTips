import { Button, Flex, Avatar, Text } from "@chakra-ui/react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { LogoIcon } from "components/Icons/LogoIcon";
import { useTranslation } from "react-i18next";

import { PATHS } from "constants/constants";
import {
  useGetGroupForPayment,
  useGetLimitedUserForPayment,
} from "graphql/hooks/useQueries";
import { useState } from "react";

import { useCreatePayment } from "graphql/hooks/useMutations";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { TextFieldRHF } from "components/react-hook-form/TextFieldRHF";
import { paymentSchema } from "../../validation/payment.schema";

import CHS from "./chakra.styles";

export default function Payment() {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const groupId = searchParams.get("groupId");
  const navigation = useNavigate();

  const [viewData, setViewData] = useState();

  const [createPayment] = useCreatePayment();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      sum: "",
    },
    resolver: yupResolver(paymentSchema),
  });

  useGetGroupForPayment({
    variables: {
      getGroupId: Number(groupId),
    },
    skip: groupId ? false : true,
    onCompleted: (data) => {
      if (!data?.getGroup) return;
      const { name, avatarUrl } = data.getGroup;
      setViewData({
        avatar: process.env.REACT_APP_DOMAIN + avatarUrl,
        name,
      });
    },
  });

  useGetLimitedUserForPayment({
    variables: {
      id: Number(userId),
    },
    skip: userId ? false : true,
    onCompleted: (data) => {
      if (!data?.getLimitedDataOfUser) return;
      const { avatarUrl, fullName } = data.getLimitedDataOfUser;
      setViewData({
        avatar: process.env.REACT_APP_DOMAIN + avatarUrl,
        name: fullName,
      });
    },
  });

  const handleSetButton = (value) => {
    setValue("sum", value);
    trigger();
  };

  const onSubmit = (data) => {
    const { sum } = data;
    if (!sum) return;
    createPayment({
      variables: {
        input: userId
          ? {
              userId: Number(userId),
              amount: sum * 100,
            }
          : {
              groupId: Number(groupId),
              amount: sum * 100,
            },
      },
      onCompleted: (response) => {
        window.location.href = response?.createPayment?.url;
      },
      onError: ({ message }) => console.error(message),
    });
  };

  if (userId && groupId) return <Navigate replace to={PATHS.solo} />;

  return (
    <Flex sx={CHS.wrapper} flexDirection="column">
      <Flex justifyContent="flex-start" width="100%">
        <LogoIcon
          cursor="pointer"
          sx={CHS.logo}
          w={24}
          h={10}
          onClick={() => {
            navigation("/");
          }}
        />
      </Flex>
      <Avatar size="2xl" name={viewData?.name} src={viewData?.avatar} />
      <Text fontSize="3xl" padding="10" lineHeight={1} textAlign="center">
        {viewData?.name}
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex justifyContent="space-between">
          <Button
            onClick={() => {
              handleSetButton(5);
            }}
          >
            5 €
          </Button>
          <Button
            onClick={() => {
              handleSetButton(10);
            }}
          >
            10 €
          </Button>
          <Button
            onClick={() => {
              handleSetButton(15);
            }}
          >
            15 €
          </Button>
          <Button
            onClick={() => {
              handleSetButton(20);
            }}
          >
            20 €
          </Button>
        </Flex>
        <TextFieldRHF
          register={register}
          name="sum"
          label=" "
          hasError={errors?.sum}
          errorMessage={errors?.sum?.message}
          placeholder={t("app.set_sum")}
          mb={5}
          type="number"
        />
        <Button size="registerButton" type="submit">
          {t("app.next")}
        </Button>
      </form>
    </Flex>
  );
}
