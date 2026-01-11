"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { CalendarCard } from "./CalendarCard";
import { DetailsCard } from "./DetailsCard";
import styles from "./styles.module.scss";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
}

export const ScheduleModal = ({
  open,
  onOpenChange,
  onDateSelect,
  initialDate = new Date(2025, 10, 23),
}: ScheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const handleConfirm = () => {
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto z-1000"
        showClose={true}
      >
        <DialogHeader>
          <DialogTitle className={styles.sectionTitle}>
            STAY SCHEDULE
          </DialogTitle>
        </DialogHeader>
        <div className={styles.cardsGrid}>
          <CalendarCard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
          <DetailsCard selectedDate={selectedDate} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="solid" size="md" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
