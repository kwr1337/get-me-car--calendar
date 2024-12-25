import React from "react";
import { useTranslation } from "react-i18next";

interface RentalFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
}

const RentalForm: React.FC<RentalFormProps> = ({
  formData,
  setFormData,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      additionalServices: {
        ...prev.additionalServices,
        [name]: checked,
      },
    }));
  };
  return (
    <form onSubmit={onSubmit} className="rental-form">
      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label">{t("pickup_date")}</label>
          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
        <div className="rental-form__col">
          <label className="rental-form__label">{t("return_date")}</label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label">{t("pickup_time")}</label>
          <input
            type="time"
            name="pickupTime"
            value={formData.pickupTime}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
        <div className="rental-form__col">
          <label className="rental-form__label">{t("return_time")}</label>
          <input
            type="time"
            name="returnTime"
            value={formData.returnTime}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label">{t("location")}</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label">{t("country")}</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
        <div className="rental-form__col">
          <label className="rental-form__label">{t("city")}</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label">{t("client")}</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label">{t("email")}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
        <div className="rental-form__col">
          <label className="rental-form__label">{t("phone")}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="rental-form__input"
            required
          />
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="telegram"
              checked={formData.telegram}
              onChange={handleChange}
              className="rental-form__checkbox"
            />
            {t("telegram")}
          </label>
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="whatsapp"
              checked={formData.whatsapp}
              onChange={handleChange}
              className="rental-form__checkbox"
            />
            {t("whatsapp")}
          </label>
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="viber"
              checked={formData.viber}
              onChange={handleChange}
              className="rental-form__checkbox"
            />
            {t("viber")}
          </label>
        </div>
        <div className="rental-form__col">
          <input
            type="tel"
            name="additionalPhone"
            value={formData.additionalPhone}
            onChange={handleChange}
            className="rental-form__input"
            placeholder={t("additional_phone")}
          />
        </div>
      </div>

      <div className="rental-form__row">
        <label className="rental-form__label">{t("coefficient")}</label>
        <input
          type="text"
          name="coefficient"
          value={formData.coefficient}
          readOnly
          className="rental-form__input"
        />
      </div>

      <div className="rental-form__row">
        <label className="rental-form__label">{t("amount_due")}</label>
        <input
          type="text"
          name="amountDue"
          value={formData.amountDue + " " + formData.currency}
          readOnly
          className="rental-form__input rental-form__input--currency"
        />
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__subtitle">
            {t("additional_services")}
          </label>
          <div className="rental-form__row">
            <input
              type="text"
              name="searchService"
              className="rental-form__input rental-form__input--search"
              placeholder={t("search")}
            />
            <button
              type="button"
              className="btn rental-form__button rental-form__button--search">
              {t("find")}
            </button>
          </div>
        </div>
      </div>

      <div className="rental-form__row">
        <div className="rental-form__col">
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="driver"
              checked={formData.additionalServices.driver}
              onChange={handleServiceChange}
              className="rental-form__checkbox"
            />
            {t("driver")}
          </label>
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="transfer"
              checked={formData.additionalServices.transfer}
              onChange={handleServiceChange}
              className="rental-form__checkbox"
            />
            {t("transfer")}
          </label>
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="childSeat"
              checked={formData.additionalServices.childSeat}
              onChange={handleServiceChange}
              className="rental-form__checkbox"
            />
            {t("child_seat")}
          </label>
          <label className="rental-form__label rental-form__label--checkbox">
            <input
              type="checkbox"
              name="bluetoothHeadset"
              checked={formData.additionalServices.bluetoothHeadset}
              onChange={handleServiceChange}
              className="rental-form__checkbox"
            />
            {t("bluetooth_headset")}
          </label>
        </div>
      </div>

      <div className="rental-form__row">
        <button
          type="submit"
          className="btn rental-form__button rental-form__button--save">
          {t("save")}
        </button>
      </div>
    </form>
  );
};

export default RentalForm;
