import React, { useEffect, useState } from "react";
import { Box, Flex, Heading, useDisclosure } from "@chakra-ui/react";
import { DropzoneFieldRHF } from "components/react-hook-form/DropzoneRHF";
import { useForm } from "react-hook-form";
import Button from "components/Button/Button";
import { TextFieldRHF } from "components/react-hook-form/TextFieldRHF";
import { useTranslation } from "react-i18next";
import { AlertModal } from "components/AlertModal";
import { ConfirmEmailAlert } from "components/Modals/ConfirmEmailAlert";
import { useCurrentUserContext, useTrimStringStartForm } from "hooks";
import { PhoneInputCustom } from "components/PhoneInputCustom/PhoneInputCustom";
import { capiatlize } from "utils/capitalize";
import { useEditUserProfile } from "graphql/hooks/useMutations";
import { transformEditUserProfile } from "connectors";
import { yupResolver } from "@hookform/resolvers/yup";
import { settingsProfileSchema } from "validation";
import CHS from "./chakra.styles";

export default function Settings() {
  const [formSending, setFormSending] = useState(false);
  const { t } = useTranslation();
  const [newEmail, setNewEmail] = useState();
  const [alertText, setAlertText] = useState("");

  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  const {
    onOpen: onOpenConfirmEmailAlert,
    isOpen: isOpenConfirmEmailAlert,
    onClose: onCloseConfirmEmailAlert,
  } = useDisclosure();

  const { currentUser, updateUser } = useCurrentUserContext();

  const INITIAL_VALUES_EDIT_PROFILE = {
    photo: currentUser?.avatarUrl && {
      preview: currentUser?.avatarUrl,
    },
    fullName: currentUser?.fullName,
    work: currentUser?.work || "",
    iban: currentUser?.iban || "",
    email: currentUser?.email,
    phoneNumber: currentUser?.phoneNumber,
    oldPassword: "",
    password: "",
    confirmPassword: "",
  };

  const {
    handleSubmit,
    register,
    control,
    getValues,
    setValue,
    trigger,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: INITIAL_VALUES_EDIT_PROFILE,
    resolver: yupResolver(settingsProfileSchema),
  });
  useTrimStringStartForm({ stringName: "fullName", watch, setValue });

  const isDirtyPhoneNumber =
    watch("phoneNumber") === INITIAL_VALUES_EDIT_PROFILE.phoneNumber;

  const isDirtyPhoto =
    watch("photo")?.preview === INITIAL_VALUES_EDIT_PROFILE?.photo?.preview;

  const [editUserProfile] = useEditUserProfile();

  const handleAlert = (message) => {
    switch (message) {
      case "Wrong password":
        setAlertText(t("app.wrong_old_password"));
        break;
      case "Phone number is already registered":
        setAlertText(t("app.phone_number_is_already_registered"));
        break;
      case "Email already exists":
        setAlertText(t("app.email_already_exists"));
        break;
      default:
        setAlertText(message);
    }
    onOpenAlert();
  };

  const onSubmit = async (values) => {
    setFormSending(true);
    await editUserProfile({
      variables: {
        input: transformEditUserProfile(
          values,
          currentUser?.email,
          currentUser?.fullName
        ),
      },
      onCompleted: (response) => {
        setFormSending(false);
        if (values?.email === response?.editUserProfile?.email) {
          setAlertText(t("app.profile_update_successfully"));
          onOpenAlert();
          updateUser(response?.editUserProfile);
          reset(INITIAL_VALUES_EDIT_PROFILE);
        } else {
          setNewEmail(values?.email);
          onOpenConfirmEmailAlert();
        }
      },
      onError: ({ graphQLErrors }) => {
        setFormSending(false);
        if (!graphQLErrors) return;
        handleAlert(graphQLErrors[0]?.message);
      },
    });
  };

  useEffect(() => {
    reset(INITIAL_VALUES_EDIT_PROFILE);
  }, [currentUser]);

  return (
    <>
      <Box mb={6}>
        <Heading variant="cabHeadPage">{t("app.profile")}</Heading>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex sx={CHS.dropZone}>
          <DropzoneFieldRHF
            control={control}
            name="photo"
            getValues={getValues}
            setValue={setValue}
            width="31"
            height="31"
          />
        </Flex>
        <Box sx={CHS.formField}>
          <TextFieldRHF
            mb={4}
            variant="flushed"
            register={register}
            name="fullName"
            label={t("app.full_name")}
            hasError={errors?.fullName}
            errorMessage={errors?.fullName?.message}
          />
          <TextFieldRHF
            mb={4}
            variant="flushed"
            register={register}
            name="work"
            label={t("app.work")}
            hasError={errors?.work}
            errorMessage={errors?.work?.message}
          />
          <TextFieldRHF
            mb={4}
            variant="flushed"
            register={register}
            name="email"
            label={t("app.e_mail")}
            hasError={errors?.email}
            errorMessage={errors?.email?.message}
            placeholder={t("app.please_enter_your_email")}
            autoComplete="off"
          />
          <PhoneInputCustom
            name="phoneNumber"
            label={t("app.phone")}
            placeholder={t("app.please_enter_your_phone")}
            setValue={setValue}
            hasError={errors?.phone}
            errorMessage={errors?.phone?.message}
            trigger={trigger}
            variant="flushed"
            mb={4}
            defaultValue={currentUser?.phoneNumber}
          />
          <TextFieldRHF
            mb={7.5}
            variant="flushed"
            register={register}
            name="iban"
            label={t("app.iban")}
            placeholder={t("app.please_enter_your_iban")}
            hasError={errors?.iban}
            errorMessage={capiatlize(errors?.iban?.message)}
          />
          <Box mb={4}>
            <Heading variant="cabHeadPage">{t("app.change_password")}</Heading>
          </Box>
          <TextFieldRHF
            mb={4}
            variant="flushed"
            register={register}
            name="oldPassword"
            label={t("app.old_password")}
            hasError={errors?.oldPassword}
            errorMessage={errors?.oldPassword?.message}
            type="password"
            sx={CHS.passwordField}
            placeholder={t("app.please_enter_your_old_password")}
          />
          <TextFieldRHF
            mb={4}
            variant="flushed"
            register={register}
            name="password"
            label={t("app.password")}
            hasError={errors?.password}
            errorMessage={errors?.password?.message}
            type="password"
            sx={CHS.passwordField}
            placeholder={t("app.please_enter_new_password")}
          />
          <TextFieldRHF
            mb={4}
            variant="flushed"
            register={register}
            name="confirmPassword"
            label={t("app.confirm_password")}
            hasError={errors?.confirmPassword}
            errorMessage={errors?.confirmPassword?.message}
            type="password"
            sx={CHS.passwordField}
            placeholder={t("app.please_confirm_a_new_password")}
          />
        </Box>
        <Button
          type="submit"
          sx={CHS.button}
          disabled={
            (!isDirty && isDirtyPhoneNumber && isDirtyPhoto) || formSending
          }
        >
          {t("app.save")}
        </Button>
      </form>

      {isOpenAlert && (
        <AlertModal isOpen={isOpenAlert} onClose={onCloseAlert}>
          <Box px={2}>
            <Heading variant="cabHeadPage" lineHeight={7}>
              {alertText}
            </Heading>
          </Box>
        </AlertModal>
      )}

      {isOpenConfirmEmailAlert && (
        <ConfirmEmailAlert
          isOpen={isOpenConfirmEmailAlert}
          onClose={onCloseConfirmEmailAlert}
          newEmail={newEmail}
        />
      )}
    </>
  );
}
