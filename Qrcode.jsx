import React, { useState } from "react";
import { Heading, useDisclosure, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { CodeItem } from "components/CodeItem";
import { useGetGroups } from "graphql/hooks/useQueries";
import { QrCodeModal } from "components/Modals/QrCode";
import { useCurrentUserContext } from "hooks";
import { EditCard } from "components/Modals/EditCard";
import { CARD_TYPE } from "constants/constants";

export default function QRCodes() {
  const [currentQr, setCurrentQr] = useState();
  const [currentCard, setCurrentCard] = useState();

  const { t } = useTranslation();

  const { currentUser, refetch: refetchUser } = useCurrentUserContext();
  const { data, refetch: refetchGroup } = useGetGroups();

  const {
    isOpen: isOpenQrModal,
    onOpen: onOpenQrModal,
    onClose: onCloseQrModal,
  } = useDisclosure();

  const {
    isOpen: isEditCardModal,
    onOpen: onOpenEditCardModal,
    onClose: onCloseEditCardModal,
  } = useDisclosure();

  const openQrModal = (obj) => {
    setCurrentQr(obj);
    onOpenQrModal();
  };

  const openEditCardModal = (obj, type) => {
    setCurrentCard({
      ...obj,
      isUser: type === "user",
    });
    onOpenEditCardModal();
  };

  return (
    <>
      <Heading variant="cabHeadPage" pb={7.5}>
        {t("app.personal_codes")}
      </Heading>
      <VStack spacing="4" pb="7.5">
        <CodeItem
          userId={currentUser?.id}
          type={CARD_TYPE.CARD}
          data={{
            id: currentUser?.id,
            url: currentUser?.fileUrls,
          }}
          openEditCardModal={(obj) => openEditCardModal(obj, "user")}
          isHorizontal={() => {}}
          mainData={currentUser}
          setCurrentCard={setCurrentCard}
          currentCard={currentCard}
        />
        <CodeItem
          userId={currentUser?.id}
          type={CARD_TYPE.QR}
          data={{ url: currentUser?.fileUrls }}
          openQrModal={openQrModal}
          setCurrentCard={setCurrentCard}
        />
      </VStack>

      <Heading variant="cabHeadPage" pb={7.5}>
        {t("app.team_codes")}
      </Heading>
      {data?.getGroups?.length > 0 ? (
        data?.getGroups?.map((group) => (
          <React.Fragment key={group?.id}>
            <Heading variant="cabHeadBox" mb="5">
              {group?.name}
            </Heading>
            <VStack spacing="4" pb="7.5">
              <CodeItem
                userId={currentUser?.id}
                type={CARD_TYPE.CARD}
                data={{
                  url: group?.fileUrls,
                }}
                openEditCardModal={openEditCardModal}
                mainData={group}
                setCurrentCard={setCurrentCard}
                currentCard={currentCard}
              />
              <CodeItem
                userId={currentUser?.id}
                type={CARD_TYPE.QR}
                data={{ url: group?.fileUrls }}
                openQrModal={openQrModal}
                setCurrentCard={setCurrentCard}
              />
            </VStack>
          </React.Fragment>
        ))
      ) : (
        <Heading variant="cabHeadBox" mb="5">
          {t("app.you_dont_have_groups_yet")}
        </Heading>
      )}
      <QrCodeModal
        isOpen={isOpenQrModal}
        onClose={onCloseQrModal}
        data={currentQr}
      />
      <EditCard
        isOpen={isEditCardModal}
        onClose={onCloseEditCardModal}
        data={currentCard}
        setCurrentCard={setCurrentCard}
        refetchGroup={refetchGroup}
        refetchUser={refetchUser}
      />
    </>
  );
}
