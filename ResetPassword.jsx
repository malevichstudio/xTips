import React, { useEffect, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { PATHS } from "constants/constants";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useRecoverPassword } from "graphql/hooks/useMutations";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthTitleBlock } from "components/AuthTitleBlock/AuthTitleBlock";
import { TextFieldRHF } from "components/react-hook-form/TextFieldRHF";
import { confirmPassword } from "validation";

const INITIAL_VALUES_RECOVER_PASSWORD = {
  password: "",
  confirmPassword: "",
};

export default function ResetPassword() {
  const [formSending, setFormSending] = useState(false);
  const [view, setView] = useState("initial");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useParams();
  const [recoverPassword] = useRecoverPassword();

  const handleNavigateToLogin = () => {
    navigate(PATHS.login);
  };

  const handleNavigateToForgotPassword = () => {
    navigate(PATHS.forgotPassword);
  };

  const userResetPasswordToken = localStorage.getItem("userResetPasswordToken");

  useEffect(() => {
    if (userResetPasswordToken === token) {
      setView("error");
      setErrorMessage(t("app.this_token_has_already_been_used"));
    }
  }, []);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: INITIAL_VALUES_RECOVER_PASSWORD,
    resolver: yupResolver(confirmPassword),
  });

  const onSubmit = (data) => {
    setFormSending(true);
    recoverPassword({
      variables: {
        token,
        password: data.password,
        confirmationPassword: data.confirmPassword,
      },
      onCompleted: () => {
        setFormSending(false);
        reset(INITIAL_VALUES_RECOVER_PASSWORD);
        setView("success");
        localStorage.setItem("userResetPasswordToken", token);
      },
      onError: ({ graphQLErrors }) => {
        setFormSending(false);
        if (graphQLErrors) {
          switch (graphQLErrors?.[0]?.message) {
            case "Account is not active":
              setView("error");
              setErrorMessage(
                t(
                  "app.account_is_not_active_please_check_your_email_and_confirm_it"
                )
              );
              break;
            case "Password recovery token not found":
              setView("error");
              setErrorMessage(t("app.this_token_has_already_been_used"));
              break;
            default:
              console.log(graphQLErrors?.[0]?.message);
          }
        }
      },
    });
  };

  return (
    <Box>
      <AuthTitleBlock
        title={t("app.create_a_new_password")}
        subTitle={t(
          "app.receive_send_and_manage_tips_directly_touchless_and_cashless"
        )}
        mb={{ base: 5, md: 10 }}
      />

      {view === "initial" && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextFieldRHF
            mb={5}
            register={register}
            name="password"
            label={t("app.password")}
            placeholder={t("app.enter_your_password")}
            hasError={errors?.password}
            errorMessage={errors?.password?.message}
            type="password"
          />
          <TextFieldRHF
            mb={10}
            register={register}
            name="confirmPassword"
            label={t("app.confirm_password")}
            placeholder={t("app.repeat_your_password")}
            hasError={errors?.confirmPassword}
            errorMessage={errors?.confirmPassword?.message}
            type="password"
          />
          <Button size="registerButton" type="submit" disabled={formSending}>
            {t("app.create")}
          </Button>
        </form>
      )}

      {view === "error" && (
        <>
          <Text size="answerTitle" variant="error">
            {t("app.error")}!
          </Text>
          <Text mb={10} fontSize="lg">
            {errorMessage}
          </Text>
          <Button
            size="registerButton"
            onClick={handleNavigateToForgotPassword}
          >
            {t("app.go_to_forgot_password")}
          </Button>
        </>
      )}

      {view === "success" && (
        <>
          <Text size="answerTitle" variant="success">
            {t("app.success")}!
          </Text>
          <Text mb={10} fontSize="lg">
            {t("app.password_changed_successfully")}
          </Text>
          <Button size="registerButton" onClick={handleNavigateToLogin}>
            {t("app.go_to_login")}
          </Button>
        </>
      )}
    </Box>
  );
}
