import { ArrowRight, ChevronDown } from "lucide-react";
import { CATCH_COPY_EN } from "../../common/constants";
import styles from "./styles.module.scss";
import { Button } from "@/ui/button";

export const Hero = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section id="hero" className={styles.heroSection}>
        {/* Main Hero Content */}
        <div className={styles.contentWrapper}>
          {/* Left side - empty to let tower image show through */}
          <div className={styles.leftColumn}></div>

          {/* Right side - Text Content */}
          <div className={styles.rightColumn}>
            {/* Small Label */}
            <p className={styles.label}>Seaside hotel / Somewhere near Tokyo</p>

            {/* Main Title */}
            <h1 className={styles.mainTitle}>
              ETERVEIL
              <br />
              HOTEL
            </h1>

            {/* Tagline */}
            <p className={styles.tagline}>{CATCH_COPY_EN}</p>

            {/* Supporting Copy */}
            <p className={styles.supportingCopy}>
              A slender tower overlooking an unnamed coastline.
              <br />
              Always open, for as long as you wish to remain.
            </p>

            {/* CTA Buttons */}
            <div className={styles.ctaButtons}>
              <Button variant="glass" size="lg">
                Reserve your stay
              </Button>

              <a href="#concept" className={styles.conceptLink}>
                View concept
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <span className={styles.scrollText}>Scroll to explore</span>
          <div
            className={styles.scrollAnimation}
            style={{ animation: "bounce 2s infinite" }}
          >
            <div className={styles.scrollLine}></div>
            <ChevronDown className="size-4 text-white/40" />
          </div>
        </div>
      </section>
    </div>
  );
};
