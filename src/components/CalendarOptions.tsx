import React, { useState, useRef, useEffect } from "react";
import Select, { StylesConfig } from "react-select";
import { IoOptions, IoSearch, IoCalendar } from "react-icons/io5";
import { DateRangePicker, StaticRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ru, enUS } from "date-fns/locale";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface SortOption {
  value: string;
  label: string;
}

interface CalendarOptionsProps {
  onSortChange: (sortBy: string) => void;
  onFilterChange: (filterBy: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void;
  defaultDateRange: { startDate: Date; endDate: Date };
}

const customStaticRanges: StaticRange[] = [
  {
    label: "thisWeek",
    range: () => {
      const today = new Date();
      const firstDay = today.getDate() - today.getDay();
      const lastDay = firstDay + 6;
      const start = new Date(today.setDate(firstDay));
      const end = new Date(today.setDate(lastDay));
      return {
        startDate: start,
        endDate: end,
      };
    },
    isSelected: (range) => {
      const today = new Date();
      const firstDay = today.getDate() - today.getDay();
      const lastDay = firstDay + 6;
      const start = new Date(today.setDate(firstDay));
      const end = new Date(today.setDate(lastDay));
      return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
    },
  },
  {
    label: "lastWeek",
    range: () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const firstDayOfCurrentWeek = new Date(
        today.setDate(today.getDate() - dayOfWeek)
      );
      const startOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - 7)
      );
      const endOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 6)
      );

      return {
        startDate: startOfLastWeek,
        endDate: endOfLastWeek,
      };
    },
    isSelected: (range) => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const firstDayOfCurrentWeek = new Date(
        today.setDate(today.getDate() - dayOfWeek)
      );
      const startOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() - 7)
      );
      const endOfLastWeek = new Date(
        firstDayOfCurrentWeek.setDate(firstDayOfCurrentWeek.getDate() + 6)
      );

      return (
        isSameDay(range.startDate, startOfLastWeek) &&
        isSameDay(range.endDate, endOfLastWeek)
      );
    },
  },
  {
    label: "thisMonth",
    range: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        startDate: start,
        endDate: end,
      };
    },
    isSelected: (range) => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
    },
  },
  {
    label: "lastMonth",
    range: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: start,
        endDate: end,
      };
    },
    isSelected: (range) => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return isSameDay(range.startDate, start) && isSameDay(range.endDate, end);
    },
  },
];

const isSameDay = (date1?: Date, date2?: Date) => {
  if (!date1 || !date2) return false;
  return date1.toDateString() === date2.toDateString();
};

const CalendarOptions: React.FC<CalendarOptionsProps> = ({
  onSortChange,
  onFilterChange,
  onSearchChange,
  onDateRangeChange,
  defaultDateRange,
}) => {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === "ru" ? ru : enUS;

  const [selectedClassSort, setSelectedClassSort] = useState<SortOption | null>(
    null
  );
  const [selectedTypeSort, setSelectedTypeSort] = useState<SortOption | null>(
    null
  );
  const [selectedIdSort, setSelectedIdSort] = useState<SortOption | null>(null);
  const [selectedNearestBookingSort, setSelectedNearestBookingSort] =
    useState<SortOption | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<SortOption | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const dropdownIconRef = useRef<HTMLDivElement | any>(null);
  const calendarIconRef = useRef<HTMLDivElement | any>(null);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState({
    startDate: defaultDateRange.startDate || startOfMonth,
    endDate: defaultDateRange.endDate || endOfMonth,
    key: "selection",
  });

  const sortOptions: SortOption[] = [
    { value: "class", label: t("class") },
    { value: "type", label: t("type") },
    { value: "id", label: t("id") },
    { value: "nearestBooking", label: t("nearestBooking") },
  ];

  const filterOptions: SortOption[] = [
    { value: "all", label: t("all") },
    { value: "available", label: t("available") },
    { value: "booked", label: t("booked") },
  ];

  const handleSortChange =
    (type: string) => (selectedOption: SortOption | null) => {
      switch (type) {
        case "class":
          setSelectedClassSort(selectedOption);
          break;
        case "type":
          setSelectedTypeSort(selectedOption);
          break;
        case "id":
          setSelectedIdSort(selectedOption);
          break;
        case "nearestBooking":
          setSelectedNearestBookingSort(selectedOption);
          break;
      }
      onSortChange(selectedOption?.value || "");
    };

  const handleFilterChange = (selectedOption: SortOption | null) => {
    setSelectedFilter(selectedOption);
    onFilterChange(selectedOption?.value || "");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleDateRangeChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;

    if (startDate) {
      const calculatedEndDate = endDate
        ? new Date(endDate)
        : new Date(startDate);
      if (!endDate) {
        calculatedEndDate.setDate(startDate.getDate() + 7);
      }

      const newDateRange = {
        startDate: new Date(startDate),
        endDate: calculatedEndDate,
        key: "selection",
      };

      setDateRange(newDateRange);
      onDateRangeChange(newDateRange);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target as Node) &&
      !event.composedPath().includes(calendarIconRef.current)
    ) {
      setIsCalendarOpen(false);
    }

    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !event.composedPath().includes(dropdownIconRef.current)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const customStyles: StylesConfig<SortOption, false> = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderRadius: 8,
      borderColor: state.isFocused ? "#429cf3" : "#e6e9f1",
      boxShadow: state.isFocused ? "0 0 0 1px #429cf3" : "none",
      "&:hover": {
        borderColor: "#429cf3",
      },
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      borderRadius: 8,
    }),
    menuList: (baseStyles) => ({
      ...baseStyles,
      padding: 4,
    }),
    option: (baseStyles) => ({
      ...baseStyles,
      borderRadius: 8,
    }),
  };

  return (
    <div className="container">
      <div className="calendar-options">
        <div className="calendar-options__item">
          <div
            className="calendar-icon"
            ref={calendarRef}
            onMouseDown={handleCalendarClick}>
            <IoCalendar
              size={24}
              className="calendar-icon"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            />
            {isCalendarOpen && (
              <div className="calendar-dropdown">
                <DateRangePicker
                  locale={locale}
                  ranges={[dateRange]}
                  inputRanges={[]}
                  weekdayDisplayFormat={"EEEEEE"}
                  staticRanges={customStaticRanges.map((range: any) => ({
                    ...range,
                    label: t(range.label),
                  }))}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  className="date-range-picker"
                />
              </div>
            )}
            <div
              className="date-range-container"
              onClick={() => setIsCalendarOpen((prev) => !prev)}>
              <p className="date-range">
                {dateRange.startDate.toLocaleDateString("ru-RU")}
              </p>
              <p className="date-range">
                {dateRange.endDate.toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
        </div>
        <div className="calendar-options__item">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t("search")}
              onChange={handleSearchChange}
            />
            <button className="search-button">
              <IoSearch size={24} />
            </button>
          </div>

          <div className="icon-dropdown" ref={dropdownIconRef}>
            <IoOptions
              size={26}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="options-icon"
            />
          </div>

          <LanguageSwitcher />

          {isDropdownOpen && (
            <div
              className="dropdown-menu"
              ref={dropdownRef}
              onMouseDown={handleDropdownClick}>
              <div className="dropdown-menu-list">
                <Select
                  styles={customStyles}
                  value={selectedFilter}
                  onChange={handleFilterChange}
                  options={filterOptions}
                  placeholder={t("status")}
                  isClearable
                />
                <Select
                  styles={customStyles}
                  value={selectedClassSort}
                  onChange={handleSortChange("class")}
                  options={sortOptions.filter(
                    (option) => option.value === "class"
                  )}
                  placeholder={t("class")}
                  isClearable
                />
                <Select
                  styles={customStyles}
                  value={selectedTypeSort}
                  onChange={handleSortChange("type")}
                  options={sortOptions.filter(
                    (option) => option.value === "type"
                  )}
                  placeholder={t("type")}
                  isClearable
                />
                <Select
                  styles={customStyles}
                  value={selectedIdSort}
                  onChange={handleSortChange("id")}
                  options={sortOptions.filter(
                    (option) => option.value === "id"
                  )}
                  placeholder={t("id")}
                  isClearable
                />
                <Select
                  styles={customStyles}
                  value={selectedNearestBookingSort}
                  onChange={handleSortChange("nearestBooking")}
                  options={sortOptions.filter(
                    (option) => option.value === "nearestBooking"
                  )}
                  placeholder={t("nearestBooking")}
                  isClearable
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarOptions;
