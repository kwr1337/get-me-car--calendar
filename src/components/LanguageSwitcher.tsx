import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoLanguage } from 'react-icons/io5';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher">
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <IoLanguage size={24} />
      </button>
      {isOpen && (
        <div className="language-dropdown">
          <button
            className={i18n.language === "en" ? "dropdown-item active" : "dropdown-item"}
            onClick={() => changeLanguage("en")}
          >
            En
          </button>
          <button
            className={i18n.language === "ru" ? "dropdown-item active" : "dropdown-item"}
            onClick={() => changeLanguage("ru")}
          >
            Ru
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
