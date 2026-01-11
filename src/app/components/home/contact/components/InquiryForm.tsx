import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import styles from "../styles.module.scss";

export function InquiryForm() {
  return (
    <form className={styles.contactForm}>
      {/* Full Name */}
      <div className={styles.formField}>
        <Label htmlFor="inq-fullname" className={styles.formLabel}>
          Full name <span className={styles.required}>*</span>
        </Label>
        <Input
          id="inq-fullname"
          placeholder="e.g. Taro Yamada"
          className={styles.formInput}
        />
      </div>

      {/* Email */}
      <div className={styles.formField}>
        <Label htmlFor="inq-email" className={styles.formLabel}>
          Email address <span className={styles.required}>*</span>
        </Label>
        <Input
          id="inq-email"
          type="email"
          placeholder="example@example.com"
          className={styles.formInput}
        />
      </div>

      {/* Subject */}
      <div className={styles.formField}>
        <Label htmlFor="subject" className={styles.formLabel}>
          Subject <span className={styles.required}>*</span>
        </Label>
        <Input
          id="subject"
          placeholder="e.g. Question about room amenities"
          className={styles.formInput}
        />
      </div>

      {/* Message */}
      <div className={styles.formField}>
        <Label htmlFor="inq-message" className={styles.formLabel}>
          Message <span className={styles.required}>*</span>
        </Label>
        <Textarea
          id="inq-message"
          rows={8}
          placeholder="Please describe your question or request in detail..."
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
          Send inquiry
        </Button>
        <p className={styles.formHelper}>
          You will receive a reply within 24 hours.
          <br />
          It is all right if your requested arrival time has already passed.
        </p>
      </div>
    </form>
  );
}
