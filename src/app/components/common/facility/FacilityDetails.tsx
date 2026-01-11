"use client";

import { ImageWithFallback } from "./ImageWithFallback";

import styles from "./FacilityDetails.module.scss";
import type { Facility } from "./types";

interface FacilityDetailsProps {
  facility: Facility;
}

export function FacilityDetails({ facility }: FacilityDetailsProps) {
  return (
    <div id={`facility-${facility.id}`} className={styles.container}>
      {/* Header Area */}
      <div className={styles.headerArea}>
        {/* Meta row */}
        <div className={styles.metaRow}>
          <span className={styles.badge}>{facility.badge}</span>
          <span className={styles.floorLabel}>{facility.floorLabel}</span>
        </div>

        {/* Title */}
        <h2 className={styles.title}>{facility.title}</h2>

        {/* Lead paragraph */}
        <p className={styles.description}>{facility.description}</p>
      </div>

      {/* Body Area - Two sub-columns */}
      <div className={styles.bodyWrapper}>
        {/* Left side - Images */}
        <div className={styles.imageSection}>
          {/* Main image */}
          <div className={styles.mainImageWrapper}>
            <ImageWithFallback
              src={facility.mainImage}
              alt={facility.mainImageAlt}
              className={styles.mainImage}
            />
          </div>

          {/* Caption */}
          <p className={styles.imageCaption}>{facility.mainImageAlt}</p>

          {/* Thumbnail gallery */}
          <div className={styles.galleryWrapper}>
            {facility.galleryImages.map((img, index) => (
              <div key={index} className={styles.galleryThumbnail}>
                <ImageWithFallback
                  src={img.url}
                  alt={img.alt}
                  className={styles.galleryImage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Details */}
        <div className={styles.detailsSection}>
          {/* Details list */}
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <dt>Hours</dt>
              <dd>{facility.details.hours}</dd>
            </div>

            <div className={styles.detailItem}>
              <dt>Location</dt>
              <dd>{facility.details.location}</dd>
            </div>

            <div className={styles.detailItem}>
              <dt>Reservation</dt>
              <dd>{facility.details.reservation}</dd>
            </div>
          </div>

          {/* Highlights section */}
          <div className={styles.highlightsSection}>
            <h3>Highlights</h3>
            <ul>
              {facility.highlights.map((highlight, index) => (
                <li key={index}>
                  <span className={styles.bullet}>•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Note */}
          <div className={styles.noteSection}>
            <p>{facility.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
