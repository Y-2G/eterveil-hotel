"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { ScheduleModal } from "../../schedule/ScheduleModal";
import styles from "../styles.module.scss";

export function ReservationForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [arrivalDate, setArrivalDate] = useState("");

  const handleDateSelect = (date: Date) => {
    const formattedDate = `${date.getFullYear()} / ${String(
      date.getMonth() + 1
    ).padStart(2, "0")} / ${String(date.getDate()).padStart(2, "0")}  — : —`;
    setArrivalDate(formattedDate);
  };

  return (
    <form className={styles.contactForm}>
      {/* Full Name */}
      <div className={styles.formField}>
        <Label htmlFor="fullname" className={styles.formLabel}>
          Full name <span className={styles.required}>*</span>
        </Label>
        <Input
          id="fullname"
          placeholder="e.g. Taro Yamada"
          className={styles.formInput}
        />
      </div>

      {/* Email */}
      <div className={styles.formField}>
        <Label htmlFor="email" className={styles.formLabel}>
          Email address <span className={styles.required}>*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@example.com"
          className={styles.formInput}
        />
      </div>

      {/* Phone */}
      <div className={styles.formField}>
        <Label htmlFor="phone" className={styles.formLabel}>
          Phone number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Optional"
          className={styles.formInput}
        />
      </div>

      {/* Arrival Date */}
      <div className={styles.formField}>
        <Label htmlFor="arrival" className={styles.formLabel}>
          Preferred arrival date and time{" "}
          <span className={styles.required}>*</span>
        </Label>
        <div style={{ position: "relative" }}>
          <Input
            id="arrival"
            placeholder="YYYY / MM / DD  — : —"
            className={styles.formInput}
            style={{ paddingRight: "2.5rem", cursor: "pointer" }}
            value={arrivalDate}
            readOnly
            onClick={() => setIsModalOpen(true)}
          />
          <Calendar
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "1rem",
              height: "1rem",
              color: "#9ca3af",
              cursor: "pointer",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Length of Stay */}
      <div className={styles.formField}>
        <Label htmlFor="length" className={styles.formLabel}>
          Length of stay
        </Label>
        <Input
          id="length"
          placeholder="e.g. 3 nights (extension possible)"
          className={styles.formInput}
        />
      </div>

      {/* Number of Guests */}
      <div className={styles.formField}>
        <Label htmlFor="guests" className={styles.formLabel}>
          Number of guests
        </Label>
        <Input
          id="guests"
          placeholder="e.g. 2 adults, 1 child"
          className={styles.formInput}
        />
      </div>

      {/* Message */}
      <div className={styles.formField}>
        <Label htmlFor="message" className={styles.formLabel}>
          Requests / Message
        </Label>
        <Textarea
          id="message"
          rows={4}
          placeholder="Sea-facing room if available / I would like to discuss my check-out time during the stay."
          className={styles.formTextarea}
        />
      </div>

      {/* Submit Button */}
      <div className={styles.formButtonContainer}>
        <Button
          type="submit"
          variant="solid"
          size="md"
          className={styles.formSubmitButton}
        >
          Send reservation request
        </Button>
        <p className={styles.formHelper}>
          You will receive a reply within 24 hours.
          <br />
          It is all right if your requested arrival time has already passed.
        </p>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDateSelect={handleDateSelect}
      />
    </form>
  );
}
