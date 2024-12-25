import React, { useState, useRef, useEffect } from "react";
import BookingCell from "./BookingCell";
import RentalModal from "./RentalModal";
import {
  generateDateRange,
  getMinMaxDates,
  calculateColSpan,
} from "../utils/dateUtils";
import { ReactMouseSelect, TFinishSelectionCallback } from "react-mouse-select";
import { IoAddCircle } from "react-icons/io5";
import { Booking } from "../types";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";


interface TransportCalendarProps {
  vehicals: {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
    rents: {
      id: number;
      start_date: string;
      end_date: string;
      country: string;
      city: string;
      client_name: string;
      email: string;
      tel: string;
      tel_2: string;
      socials: { [key: string]: boolean }[];
      payment_koeff: number;
      payable: number;
      currency: string;
      services: number[];
    }[];
  }[];
  refreshData: () => void;
}

const TransportCalendar: React.FC<TransportCalendarProps> = ({ vehicals , refreshData}) => {
  const { t } = useTranslation();

  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [selectedRent, setSelectedRent] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState<any | null>(null);
  const [initialRow, setInitialRow] = useState<number | null>(null);
  const [highlightedHeaders, setHighlightedHeaders] = useState<number[]>([]);
  const [highlightedRows, setHighlightedRows] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const observer = new MutationObserver(() => {
      const selectedItems = containerRef.current?.querySelectorAll(".selected");
      const selectedHeaders = new Set<number>();
      const selectedRows = new Set<number>();

      selectedItems?.forEach((item) => {
        const index = parseInt(item.getAttribute("data-id") || "");
        const rowId = parseInt(item.getAttribute("data-row") || "");
        if (!isNaN(index)) selectedHeaders.add(index);
        if (!isNaN(rowId)) selectedRows.add(rowId);
      });

      const smallestRowId =
          selectedRows.size > 0 ? Array.from(selectedRows)[0] : null;

      setHighlightedHeaders(Array.from(selectedHeaders));
      setHighlightedRows(smallestRowId !== null ? [smallestRowId] : []);
    });

    const observeTarget = containerRef.current;
    if (observeTarget) {
      observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const { minDate, maxDate } = getMinMaxDates(
      vehicals.flatMap((vehical) => vehical.rents)
  );

  const validDate = (date: Date): boolean => !isNaN(date.getTime());

  const minDateStr = validDate(minDate)
      ? minDate.toISOString().split("T")[0]
      : "";
  const maxDateStr = validDate(maxDate)
      ? maxDate.toISOString().split("T")[0]
      : "";
  const dates: string[] =
      validDate(minDate) && validDate(maxDate)
          ? generateDateRange(minDateStr, maxDateStr)
          : [];

  const groupedBookings = vehicals.reduce<Record<number, Booking[]>>(
      (acc, vehical) => {
        vehical.rents.forEach((rent: any) => {
          const numericId = vehical.id;
          if (!acc[numericId]) {
            acc[numericId] = [];
          }
          acc[numericId].push(rent);
        });
        return acc;
      },
      {}
  );



  const handleFinishSelection: TFinishSelectionCallback = (items) => {

    const vehicalsSnapshot = vehicals;

    const selectedDates = items
        .map((item) => item.getAttribute("data-date") || "")
        .filter((date) => date !== "");

    const selectedRows = Array.from(
        new Set(
            items.map((item) => {
              const row = item.getAttribute("data-row");
              return parseInt(row || "", 10);
            })
        )
    );

    const smallestRowId = selectedRows.length > 0 ? selectedRows[0] : null;

    if (smallestRowId !== null) {
      setInitialRow(smallestRowId);

      const bookingsInRow = groupedBookings[smallestRowId] || [];
      if (bookingsInRow.length === 0 || selectedDates.length > 0) {
        const newRent = {
          start_date: selectedDates[0] + "T09:00:00",
          end_date: selectedDates[selectedDates.length - 1] + "T18:00:00",
          payment_koeff: 0,
          payable: 0,
        };

        setSelectedRent(newRent);

        const vehical = vehicals.find((v) => v.id.toString() === smallestRowId.toString());


        if (vehical) {
          setVehicle({
            id: vehical.id,
            name: vehical.name,
            type: vehical.type,
            class: vehical.class,
            brand: vehical.brand,
            model: vehical.model,
            engine_type: vehical.engine_type,
            edit_url: vehical.edit_url,
          });
        }
      }
    }
  };




  const handleVehicleInfo = (
      rent: any,
      vehicle: {
        id: number;
        name: string;
        type: string;
        class: string;
        brand: string;
        model: string;
        engine_type: string;
        edit_url: string;
      }
  ) => {
    setSelectedRent(rent);
    setVehicle(vehicle);
  };

  const handleOpenRentalForm = (vehicle: {
    id: number;
    name: string;
    type: string;
    class: string;
    brand: string;
    model: string;
    engine_type: string;
    edit_url: string;
  }) => {
    const defaultRent = {
      start_date: new Date().toISOString().split("T")[0] + "T09:00:00",
      end_date: new Date().toISOString().split("T")[0] + "T18:00:00",
      payment_koeff: 0,
      payable: 0,
    };

    setSelectedRent(defaultRent);
    setVehicle(vehicle);
  };

  const createBookingMatrix = () => {
    const matrix: {
      transportName: string;
      transportId: number;
      transportEditUrl: string;
      cells: JSX.Element[];
    }[] = [];

    vehicals.forEach((vehical, rowIndex) => {
      const row: JSX.Element[] = [];
      const relevantBookings = [...vehical.rents].sort((a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      const occupiedColumns = new Array(dates.length).fill(false); // Используем массив булевых значений
      let colIndex = 0;

      relevantBookings.forEach((rent, index) => {
        const startDate = rent.start_date.slice(0, 10);
        const endDate = rent.end_date.slice(0, 10);

        // Найдем индексы начала и конца бронирования
        let startCol = dates.indexOf(startDate);
        let endCol = dates.indexOf(endDate);

        if (startCol < 0 || endCol < 0) {
          // console.warn(
          //     `Invalid date range for rent: ${startDate} - ${endDate}. Skipping...`
          // );
          return; // Пропускаем некорректные данные
        }

        // Убедимся, что индексы находятся в пределах диапазона
        endCol = Math.min(endCol, dates.length - 1);

        // Проверяем занятость колонок и корректируем startCol
        while (startCol <= endCol && occupiedColumns[startCol]) {
          startCol++;
        }

        // Корректируем endCol в случае пересечения
        let adjustedEndCol = endCol;
        for (let i = startCol; i <= endCol; i++) {
          if (occupiedColumns[i]) {
            adjustedEndCol = i - 1;
            break;
          }
        }

        // Итоговый colSpan
        const finalColSpan = adjustedEndCol - startCol + 1;

        if (finalColSpan <= 0) {
          // console.warn(`Skipping booking for vehicle ${vehical.name}, no space available`);
          return; // Пропускаем, если место недоступно
        }

        // Заполняем пустые ячейки перед бронированием
        while (colIndex < startCol) {
          row.push(
              <td
                  key={`empty-${vehical.id}-${colIndex}`}
                  className="cell"
                  data-id={colIndex.toString()}
                  data-row={vehical.id.toString()}
                  data-date={dates[colIndex]}
              />
          );
          colIndex++;
        }

        // Добавляем ячейку бронирования
        row.push(
            <BookingCell
                key={`booking-${vehical.id}-${startCol}`}
                rent={rent}
                index={index}
                rowSpan={1}
                colSpan={finalColSpan}
                rowIndex={rowIndex}
                onClick={() => handleVehicleInfo(rent, vehical)}
            />
        );

        // Помечаем колонки как занятые
        for (let i = startCol; i <= adjustedEndCol; i++) {
          occupiedColumns[i] = true;
        }

        colIndex = adjustedEndCol + 1; // Сдвигаем colIndex
      });

      // Заполняем оставшиеся пустые ячейки
      while (colIndex < dates.length) {
        row.push(
            <td
                key={`empty-${vehical.id}-${colIndex}`}
                className="cell"
                data-id={colIndex.toString()}
                data-row={vehical.id.toString()}
                data-date={dates[colIndex]}
            />
        );
        colIndex++;
      }

      matrix.push({
        transportName: vehical.name,
        transportId: vehical.id,
        transportEditUrl: vehical.edit_url,
        cells: row,
      });
    });

    return matrix;
  };





  const bookingMatrix = createBookingMatrix();

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      containerRef.current.scrollLeft += event.deltaY; // Changes horizontal scrolling
      event.preventDefault(); // Prevents default scrolling behavior
    }
  };

  return (
      <>
        <main
            className="calendar-container container"
            ref={containerRef}
            onWheel={handleWheel}
        >
          <table className="transport-calendar">
            <thead>
            <tr>
              <th>{t("transport")}</th>
              {dates.map((date, index) => (
                  <th
                      key={index}
                      className={
                        highlightedHeaders.includes(index)
                            ? "highlighted-header date-cell"
                            : "date-cell"
                      }
                      data-date={date}
                  >
                    {new Date(date).toLocaleDateString("ru-RU").substring(0, 5)}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody>
            {bookingMatrix.length > 0 ? (
                bookingMatrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td
                          className={
                            highlightedRows.includes(row.transportId)
                                ? "highlighted-transport"
                                : ""
                          }
                      >
                        <button
                            className="btn transport-btn-icon"
                            onClick={() =>
                                handleOpenRentalForm({
                                  id: row.transportId,
                                  name: row.transportName,
                                  type: "",
                                  class: "",
                                  brand: "",
                                  model: "",
                                  engine_type: "",
                                  edit_url: row.transportEditUrl,
                                })
                            }
                        >
                          <IoAddCircle size={32} />
                        </button>
                        <a className="link" href={row.transportEditUrl}>
                          {row.transportName || ""}
                        </a>
                      </td>
                      {row.cells}
                    </tr>
                ))
            ) : (
                // <tr>
                //   <td className="cell" colSpan={dates.length + 1}>
                //     {t("noBookingsData")}  <ClipLoader color="#007bff" size={50} />
                //   </td>
                // </tr>
                <div style={{textAlign: "center", margin: "20px"}}>
                  <ClipLoader color="#007bff" size={50}/>
                </div>
            )}
            <tr>
              <td className="cell">
                <button
                    className="btn cell-btn"
                    onClick={() => alert(t("addVehicle"))}
                >
                  {t("addVehicle")}
                </button>
                <button
                    className="btn cell-btn-icon"
                    onClick={() => alert(t("addVehicle"))}
                >
                  <IoAddCircle size={32} />
                </button>
              </td>
              {Array(dates.length)
                  .fill(null)
                  .map((_, index) => (
                      <td key={`empty-${index}`} className="cell--disabled" />
                  ))}
            </tr>
            </tbody>
          </table>
        </main>
        <ReactMouseSelect
            containerRef={containerRef}
            itemClassName="cell"
            selectedItemClassName="selected"
            frameClassName="mouse-select__frame"
            openFrameClassName="open"
            finishSelectionCallback={handleFinishSelection}
            sensitivity={5}
        />
        {selectedRent && (
            <RentalModal
                isOpen={!!selectedRent}
                onClose={() => {
                  setSelectedRent(null);
                  refreshData()
                }}
                rent={selectedRent}
                vehicle={vehicle}
            />
        )}
      </>
  );
};

export default TransportCalendar;
