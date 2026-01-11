import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./styles.module.scss";

interface CalendarCardProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export function CalendarCard({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
}: CalendarCardProps) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <div className={styles.calendarCard}>
      {/* Month navigation */}
      <div className={styles.monthNavigation}>
        <button
          onClick={previousMonth}
          className={styles.navButton}
        >
          <ChevronLeft />
        </button>
        <h2 className={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className={styles.navButton}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>
        {/* Weekday headers */}
        <div className={styles.weekdaysRow}>
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`${styles.weekdayHeader} ${index === 0 ? styles.sunday : ""}`}
            >
              {day.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className={styles.datesRow}>
          {days.map((day, index) => {
            if (!day) {
              return (
                <div key={`empty-${index}`} className={styles.emptyDateCell}></div>
              );
            }

            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`${styles.dateCell} ${isSelected ? styles.selected : ""}`}
              >
                <span className={styles.dateNumber}>{day.getDate()}</span>
                <span className={styles.dateCircle}>○</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.calendarLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendCircle}>○</span>
          <span>Reservations accepted</span>
        </div>
      </div>
    </div>
  );
}
