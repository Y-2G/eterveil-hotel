import { useState } from "react";
import { ReservationForm } from "./components/ReservationForm";
import { InquiryForm } from "./components/InquiryForm";
import styles from "./styles.module.scss";
import { Heading } from "../../atoms/heading/Heading";
import { Button } from "@/ui/button";

type TabType = "reservation" | "inquiry";

export function ContactSection() {
  const [activeTab, setActiveTab] = useState<TabType>("reservation");

  return (
    <section className={styles.contact}>
      {/* Header */}
      <div className={styles.contactHeader}>
        <Heading as="h2" isUnderLined={true} className="fade-target">
          CONTACT
        </Heading>
        <p className={styles.headerDescription}>
          For reservations and quiet questions that cannot wait.
        </p>
      </div>

      {/* Main Card */}
      <div className={styles.contactCard}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <Button
              variant="tab"
              size="tab"
              onClick={() => setActiveTab("reservation")}
              data-state={activeTab === "reservation" ? "active" : "inactive"}
            >
              Reservation
            </Button>
            <Button
              variant="tab"
              size="tab"
              onClick={() => setActiveTab("inquiry")}
              data-state={activeTab === "inquiry" ? "active" : "inactive"}
            >
              Inquiry
            </Button>
          </div>
          <p className={styles.tabDescription}>
            {activeTab === "reservation"
              ? "Please tell us when you would like your stay to begin."
              : "Let us know your questions or special requests."}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className={styles.contentContainer}>
          {/* Left Column - Guidance */}
          <div className={styles.guidanceColumn}>
            <div className={styles.guidanceSection}>
              <p className={styles.sectionTitle}>
                {activeTab === "reservation"
                  ? "RESERVATION OVERVIEW"
                  : "INQUIRY GUIDANCE"}
              </p>
              <div className={styles.guidanceText}>
                {activeTab === "reservation" ? (
                  <p>
                    Our staff will reply within 24 hours, regardless of seasons,
                    holidays, or time zones. Late-night or early-morning
                    arrivals are welcome.
                  </p>
                ) : (
                  <>
                    <p>
                      Whether you have questions about room availability,
                      amenities, or the nature of time at Eterveil Hotel, we are
                      here to answer.
                    </p>
                    <p>
                      All inquiries receive a response within 24 hours, even
                      those sent from dates that have not yet occurred.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className={styles.guidanceFooter}>
              <p>
                {activeTab === "reservation"
                  ? "Your stay may be extended beyond your original dates, subject only to your consent."
                  : "Some questions answer themselves during your stay."}
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className={styles.formColumn}>
            {activeTab === "reservation" ? (
              <ReservationForm />
            ) : (
              <InquiryForm />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
