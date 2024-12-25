import React, { useState, useEffect } from "react";
import CalendarOptions from "./components/CalendarOptions";
import TransportCalendar from "./components/TransportCalendar";
import TransportCalendarMobile from "./components/TransportCalendarMobile";
import { getToken, validateToken } from "./api/auth.ts";
import {fetchVehicles} from "./api/vehicles.ts";

// Определение типов
interface Rent {
  id: number;
  start_date: string;
  end_date: string;
  country: string;
  city: string;
  client_name: string;
  email: string;
  tel: string;
  tel_2: string;
  socials: { Telegram: boolean; Whatsapp: boolean; Viber: boolean }[];
  payment_koeff: number;
  payable: number;
  currency: string;
  services: number[];
}

interface Vehicle {
  id: number;
  name: string;
  type: string;
  class: string;
  brand: string;
  model: string;
  engine_type: string;
  edit_url: string;
  rents: Rent[];
}

function getMinMaxDates(vehicles: Vehicle[]): { minDate: Date; maxDate: Date } {
  const rentDates = vehicles.flatMap((v) =>
      v.rents.map((r) => {
        return {
          start: new Date(r.start_date).getTime(),
          end: new Date(r.end_date).getTime(),
        };
      })
  );

  const minDate = new Date(Math.min(...rentDates.map((r) => r.start)));
  const maxDate = new Date(Math.max(...rentDates.map((r) => r.end)));

  return { minDate, maxDate };
}

const formatDate = (date: Date, startOfDay = true): string => {
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Месяц начинается с 0
  const day = pad(date.getDate());
  const hours = startOfDay ? "00" : "23";
  const minutes = startOfDay ? "00" : "59";
  const seconds = startOfDay ? "00" : "59";
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

function App() {
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const [token, setToken] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const normalizeVehiclesData = (vehicles: any[]): Vehicle[] => {
    return vehicles.map(vehicle => ({
      ...vehicle,
      rents: vehicle.rents.flat(), // Разворачиваем вложенные массивы
    }));
  };

  const { minDate, maxDate } = getMinMaxDates(vehicles);

  const [sortBy, setSortBy] = useState<string>("");
  const [filterBy, setFilterBy] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: oneWeekAgo,
    endDate: today,
  });

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        let validToken = storedToken;

        if (!storedToken || !(await validateToken(storedToken))) {
          validToken = await getToken();
          localStorage.setItem("authToken", validToken);
        }

        console.log(validToken);
        setToken(validToken);
      } catch (error) {
        console.error("Ошибка авторизации:", error);
      }
    };

    fetchToken();

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handleResize = () => setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);


  const fetchVehiclesData = async () => {
    try {
      if (!token) return;

      const startDate = formatDate(dateRange.startDate, true);
      const endDate = formatDate(dateRange.endDate, false);

      const data = await fetchVehicles(token, startDate, endDate);
      setVehicles(normalizeVehiclesData(data.vehicals));
    } catch (error) {
      console.error("Ошибка загрузки данных транспортных средств:", error);
    }
  };

  useEffect(() => {

    fetchVehiclesData();
  }, [token, dateRange]);

  const handleSortChange = (sortBy: string) => {
    setSortBy(sortBy);
  };

  const handleFilterChange = (filterBy: string) => {
    setFilterBy(filterBy);
  };

  const handleSearchChange = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range);
  };

  const filteredVehicles = vehicles.map((vehicle) => {
    const filteredRents = vehicle.rents.filter((rent) => {
      const itemStartDate = new Date(rent.start_date);
      const itemEndDate = new Date(rent.end_date);
      const { startDate, endDate } = dateRange;

      return (
          (itemStartDate >= startDate && itemStartDate <= endDate) ||
          (itemEndDate >= startDate && itemEndDate <= endDate)
      );
    });

    return { ...vehicle, rents: filteredRents };
  });


  return (
      <div className="calendar-wrapper">
        <CalendarOptions
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onDateRangeChange={handleDateRangeChange}
            defaultDateRange={{
              startDate: oneWeekAgo,
              endDate: today,
            }}
        />
        {isMobile ? (
            <TransportCalendarMobile vehicals={filteredVehicles} />
        ) : (
            <TransportCalendar vehicals={filteredVehicles} refreshData={fetchVehiclesData} />
        )}
      </div>
  );
}

export default App;
