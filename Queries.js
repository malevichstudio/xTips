import { useLazyQuery, useQuery } from "@apollo/client";
import * as QUERIES from "graphql/queries";

export const useSignIn = (options) => {
  return useLazyQuery(QUERIES.SIGN_IN, options);
};

export const useGetUser = (options) => {
  return useQuery(QUERIES.GET_USER, {
    ...options,
    fetchPolicy: "network-only",
  });
};

export const useGetGroups = (options) => {
  return useQuery(QUERIES.GET_GROUPS, options);
};

export const useGetLimitedUser = (options) => {
  return useQuery(QUERIES.GET_LIMITED_USER, options);
};
export const useGetLimitedUserForPayment = (options) => {
  return useQuery(QUERIES.GET_LIMITED_USER_FOR_PAYMENT, options);
};

export const useGetGroup = (options) => {
  return useQuery(QUERIES.GET_GROUP, options);
};

export const useGetGroupForPayment = (options) => {
  return useQuery(QUERIES.GET_GROUP_FOR_PAYMENT, options);
};

export const useGetMyInvitations = () => {
  return useQuery(QUERIES.GET_MY_INVITATIONS, {
    fetchPolicy: "network-only",
  });
};

export const useGetNotification = (option) => {
  return useQuery(QUERIES.GET_NOTIFICATION, {
    ...option,
    fetchPolicy: "network-only",
  });
};

export const useGetInnerTransactions = (options) => {
  return useQuery(QUERIES.GET_INNER_TRANSACTIONS, options);
};
