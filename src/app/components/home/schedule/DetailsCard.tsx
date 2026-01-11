import React from "react";
import styles from "./styles.module.scss";

interface DetailsCardProps {
  selectedDate: Date;
}

export function DetailsCard({ selectedDate }: DetailsCardProps) {
  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
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

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
  };

  return (
    <div className={styles.detailsCard}>
      {/* Selected date */}
      <div className={styles.detailSection}>
        <label className={styles.detailLabel}>SELECTED DATE</label>
        <div className={styles.selectedDateValue}>
          {formatDate(selectedDate)}
        </div>
      </div>

      {/* Stay hours */}
      <div className={styles.detailSection}>
        <label className={styles.detailLabel}>STAY HOURS</label>
        <div className={styles.stayHoursList}>
          <div className={styles.stayHourItem}>
            <span className={styles.label}>Check-in</span>
            <span className={`${styles.value} ${styles.italic}`}>
              Whenever you are ready
            </span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className={styles.detailSection}>
        <label className={styles.detailLabel}>AVAILABILITY</label>
        <div className={styles.availabilityList}>
          <div className={styles.availabilityItem}>
            <span className={styles.circle}>○</span>
            <span className={styles.text}>
              Reservations accepted for this date
            </span>
          </div>
          <div className={styles.availabilityItem}>
            <span className={styles.circle}>○</span>
            <span className={styles.text}>
              Rooms available for extended stays
            </span>
          </div>
        </div>
      </div>

      {/* Guest notes */}
      <div className={styles.guestNotesSection}>
        <label className={styles.detailLabel}>GUEST NOTES</label>
        <div className={styles.guestNotesList}>
          <div className={styles.guestNoteItem}>
            <span className={styles.bullet}></span>
            <span className={styles.text}>
              All dates marked with ○ are available for reservation.
            </span>
          </div>
          <div className={styles.guestNoteItem}>
            <span className={styles.bullet}></span>
            <span className={styles.text}>
              We do not close for holidays, seasons, or maintenance.
            </span>
          </div>
          <div className={styles.guestNoteItem}>
            <span className={styles.bullet}></span>
            <span className={styles.text}>
              Your stay may be extended indefinitely, subject to your consent.
            </span>
          </div>
          <div className={styles.guestNoteItem}>
            <span className={styles.bullet}></span>
            <span className={styles.text}>
              If you wish to leave earlier than planned, please let us know.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
