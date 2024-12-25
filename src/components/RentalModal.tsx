import React, { useEffect, useState } from "react";
import RentalForm from "./RentalForm";
import { useTranslation } from "react-i18next";
import { createOrUpdateRent } from "../api/rental";

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rent: any;
  vehicle: {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
  } | null;
}

const RentalModal: React.FC<RentalModalProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   rent,
                                                   vehicle,
                                                 }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    pickupDate: new Date(rent.start_date).toISOString().split("T")[0] || "",
    returnDate: new Date(rent.end_date).toISOString().split("T")[0] || "",
    pickupTime: rent.start_date
        ? new Date(rent.start_date).toISOString().split("T")[1].slice(0, 5)
        : "00:00",
    returnTime: rent.end_date
        ? new Date(rent.end_date).toISOString().split("T")[1].slice(0, 5)
        : "00:00",
    location: rent.city || "",
    country: rent.country || "",
    city: rent.city || "",
    clientName: rent.client_name || "",
    email: rent.email || "",
    phone: rent.tel || "",
    additionalPhone: rent.tel_2 || "",
    telegram: rent.socials?.[0]?.Telegram || false,
    whatsapp: rent.socials?.[0]?.Whatsapp || false,
    viber: rent.socials?.[0]?.Viber || false,
    coefficient: typeof rent.payment_koeff === "number" ? rent.payment_koeff.toFixed(2) : "0",
    amountDue: typeof rent.payable === "number" ? rent.payable.toFixed(2) : "0",
    currency: rent.currency || "",
    additionalServices: {
      driver: false,
      transfer: false,
      childSeat: false,
      bluetoothHeadset: false,
    },
  });

  const [showConfirm, setShowConfirm] = useState(false);

  const onModalClose = () => {
    setShowConfirm(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowConfirm(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConfirm(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isOpen && !showConfirm) return null;

  const handleSubmit = async () => {
    const isEdit = Boolean(rent.id);
    const payload = {
      vehical_id: Number(vehicle?.id),
      rent_id: isEdit ? Number(rent.id) : undefined,
      start_date: `${formData.pickupDate}T${formData.pickupTime}:00`,
      end_date: `${formData.returnDate}T${formData.returnTime}:00`,
      country: formData.country,
      city: formData.city,
      client_name: formData.clientName,
      email: formData.email,
      tel: formData.phone,
      tel_2: formData.additionalPhone,
      socials: [
        {
          Telegram: formData.telegram,
          Whatsapp: formData.whatsapp,
          Viber: formData.viber,
        },
      ],
      payment_koeff: parseFloat(formData.coefficient),
      payable: parseFloat(formData.amountDue),
      currency: formData.currency,
      services: [],
    };

    try {
      const token = localStorage.getItem("authToken")
      const response = await createOrUpdateRent(payload, token);

      onClose();
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
    }
  };

  const handleConfirmClose = (action: "save" | "discard" | "cancel") => {
    if (action === "save") {
      handleSubmit();
    } else if (action === "discard") {
      onClose();
    } else if (action === "cancel") {
      setShowConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div
          className={`modal-overlay ${isOpen ? "modal-overlay--open" : ""}`}
          onClick={handleOverlayClick}>
        <div className="modal">
          <div className="modal__header">
            <h2 className="modal__title">{t("rentalModal.title")}</h2>
            {vehicle ? (
                <h3 className="modal__subtitle">{vehicle.name}</h3>
            ) : (
                <h3 className="modal__subtitle">
                  {t("rentalModal.noVehicleInfo")}
                </h3>
            )}
            <button onClick={onModalClose} className="modal__close-button">
              &times;
            </button>
          </div>
          <RentalForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          />
        </div>
        {showConfirm && (
            <div className="confirm-overlay">
              <div className="confirm-modal">
                <h3 className="confirm-modal__title">
                  {t("confirmModal.unsavedChangesTitle")}
                </h3>
                <p className="confirm-modal__text">
                  {t("confirmModal.unsavedChangesText")}
                </p>
                <button
                    className="btn confirm-modal__button confirm-modal__button--save"
                    onClick={() => handleConfirmClose("save")}>
                  {t("confirmModal.save")}
                </button>
                <button
                    className="btn confirm-modal__button confirm-modal__button--discard"
                    onClick={() => handleConfirmClose("discard")}>
                  {t("confirmModal.discard")}
                </button>
                <button
                    className="btn confirm-modal__button confirm-modal__button--cancel"
                    onClick={() => handleConfirmClose("cancel")}>
                  {t("confirmModal.cancel")}
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default RentalModal;
