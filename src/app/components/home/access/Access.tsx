"use client";

import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heading } from "../../atoms/heading/Heading";
import { DebugGUI } from "../../common/DebugGUI";
import { useMapConfig } from "../../../hooks/useMapConfig";
import { Button } from "@/ui/button";
import styles from "./styles.module.scss";

gsap.registerPlugin(ScrollTrigger);

export type AccessRef = {
  handleMoreClick: () => void;
};

type Props = {
  orbitControlsEnabled?: boolean;
  onToggleOrbitControls?: () => void;
};

export const Access = forwardRef<AccessRef, Props>(
  ({ orbitControlsEnabled = false, onToggleOrbitControls }, ref) => {
    const { mapConfig, setMapConfig, hotelConfig, setHotelConfig } =
      useMapConfig();

    const headerRef = useRef<HTMLDivElement>(null);
    const mapCaptionRef = useRef<HTMLDivElement>(null);
    const siteHeaderRef = useRef<HTMLElement | null>(null);
    const fixedButtonsRef = useRef<HTMLDivElement>(null);
    const accessInfoPopupRef = useRef<HTMLDivElement>(null);
    const [isAccessInfoOpen, setIsAccessInfoOpen] = useState(false);

    useEffect(() => {
      siteHeaderRef.current = document.querySelector("header");
    }, []);

    // MOREボタンクリック時のハンドラ
    const handleMoreClick = () => {
      if (isAccessInfoOpen) {
        // 閉じるアニメーション
        gsap.to(accessInfoPopupRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => setIsAccessInfoOpen(false),
        });
      } else {
        // 開くアニメーション - stateだけ変更し、アニメーションはuseEffectで実行
        setIsAccessInfoOpen(true);
      }
    };

    // ポップアップが開いた後にアニメーションを実行
    useEffect(() => {
      if (isAccessInfoOpen && accessInfoPopupRef.current) {
        gsap.fromTo(
          accessInfoPopupRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
      }
    }, [isAccessInfoOpen]);

    useEffect(() => {
      if (!isAccessInfoOpen) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        const popup = accessInfoPopupRef.current;
        if (!popup || popup.contains(event.target as Node)) {
          return;
        }
        handleMoreClick();
      };

      document.addEventListener("pointerdown", handlePointerDown);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    }, [isAccessInfoOpen, handleMoreClick]);

    // 外部からhandleMoreClickを呼び出せるようにする
    useImperativeHandle(ref, () => ({
      handleMoreClick,
    }));

    // 要素を画面外へ拡散させるアニメーション
    const disperseElements = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          // アニメーション完了後にz-indexを切り替え
          onToggleOrbitControls?.();
        },
      });

      // ヘッダーを上方向へ
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            y: -200,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
          },
          0
        );
      }
      if (siteHeaderRef.current) {
        tl.to(
          siteHeaderRef.current,
          {
            y: -200,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
          },
          0
        );
      }

      // キャプションを下方向へ
      if (mapCaptionRef.current) {
        tl.to(
          mapCaptionRef.current,
          {
            y: 100,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
          },
          0
        );
      }

      return tl;
    };

    // 要素を元の位置に戻すアニメーション
    const gatherElements = () => {
      const tl = gsap.timeline();

      // ヘッダーを元に戻す
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          0
        );
      }
      if (siteHeaderRef.current) {
        tl.to(
          siteHeaderRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          0
        );
      }

      // キャプションを元に戻す
      if (mapCaptionRef.current) {
        tl.to(
          mapCaptionRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          0
        );
      }

      return tl;
    };

    // orbitControlsEnabledがfalseになったら要素を元に戻す
    useEffect(() => {
      if (!orbitControlsEnabled) {
        gatherElements();
      }
    }, [orbitControlsEnabled]);

    // 固定ヘッダーとボタンのScrollTriggerアニメーション（captionと同期）
    useEffect(() => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: "#access",
          start: "top bottom",
          end: "bottom bottom",
          onEnter: () => {
            gsap.set(headerRef.current, { display: "block" });
            gsap.set(fixedButtonsRef.current, { display: "flex" });
            gsap.to([headerRef.current, fixedButtonsRef.current], {
              autoAlpha: 1,
              duration: 0.5,
              ease: "power2.out",
              overwrite: true,
            });
          },
          onLeave: () => {
            gsap.to([headerRef.current, fixedButtonsRef.current], {
              autoAlpha: 0,
              duration: 0.3,
              ease: "power2.in",
              overwrite: true,
              onComplete: () => {
                gsap.set(headerRef.current, { display: "none" });
                gsap.set(fixedButtonsRef.current, { display: "none" });
              },
            });
          },
          onEnterBack: () => {
            gsap.set(headerRef.current, { display: "block" });
            gsap.set(fixedButtonsRef.current, { display: "flex" });
            gsap.to([headerRef.current, fixedButtonsRef.current], {
              autoAlpha: 1,
              duration: 0.5,
              ease: "power2.out",
              overwrite: true,
            });
          },
          onLeaveBack: () => {
            gsap.to([headerRef.current, fixedButtonsRef.current], {
              autoAlpha: 0,
              duration: 0.3,
              ease: "power2.in",
              overwrite: true,
              onComplete: () => {
                gsap.set(headerRef.current, { display: "none" });
                gsap.set(fixedButtonsRef.current, { display: "none" });
              },
            });
          },
        });
      });
      return () => ctx.revert();
    }, []);

    const [buttonText, setButtonText] = useState("EXPLORE");
    // ボタンクリック時のハンドラ
    const handleExploreClick = () => {
      setButtonText(buttonText === "EXPLORE" ? "CLOSE" : "EXPLORE");
      disperseElements();
    };

    return (
      <>
        <DebugGUI
          mapConfig={mapConfig}
          setMapConfig={setMapConfig}
          hotelConfig={hotelConfig}
          setHotelConfig={setHotelConfig}
        />
        {/* Fixed Header - controlled by ScrollTrigger (synced with caption) */}
        <div
          ref={headerRef}
          className={styles.fixedHeader}
          style={{ display: "none" }}
        >
          <Heading as="h2" isUnderLined={true} className="fade-target">
            ACCESS
          </Heading>
          <p className={styles.sectionSubtitle}>
            Finding your way here is simple. Leaving can take a little longer.
          </p>
        </div>
        {/* Map Caption - controlled by Canvas ScrollTrigger */}
        <div
          id="mapCaptionWrap"
          ref={mapCaptionRef}
          data-disperse="bottom"
          className={styles.mapCaptionWrap}
          style={{ opacity: 0, display: "none" }}
        >
          <div className={styles.mapCaptionOverlay}>
            {/* Left: Route SVG */}
            <div className={styles.infoBarSvg}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 820 110"
                role="img"
                aria-label="Route D: Tokyo Station to Shiosaki Pier, then Charter 03 to Eterveil Island, then to hotel"
              >
                <defs>
                  <style>
                    {`.label { font: 12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill:#fff; opacity:.9; }
                  .sub { font: 11px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; fill:#fff; opacity:.65; }`}
                  </style>
                </defs>

                {/* segments */}
                {/* City leg: Tokyo -> Shiosaki */}
                <path
                  d="M 40 56 L 260 56"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.95"
                />

                {/* Waiting / boarding gap cue (subtle) */}
                <path
                  d="M 260 56 L 420 56"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="2 10"
                  opacity="0.55"
                />

                {/* Charter (sea): Charter 03 */}
                <path
                  d="M 420 56 L 620 56"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="12 7"
                  opacity="0.88"
                />

                {/* Arrival to hotel (short final leg) */}
                <path
                  d="M 620 56 L 780 56"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* nodes */}
                <circle cx="40" cy="56" r="7" fill="#fff" />
                <circle cx="260" cy="56" r="7" fill="#fff" />
                <circle cx="420" cy="56" r="7" fill="#fff" />
                <circle cx="620" cy="56" r="7" fill="#fff" />
                <circle cx="780" cy="56" r="9" fill="#fff" />

                {/* destination halo */}
                <circle
                  cx="780"
                  cy="56"
                  r="16"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.2"
                  opacity="0.16"
                />

                {/* labels (top) */}
                <text x="40" y="30" className="label" textAnchor="middle">
                  Tokyo Station
                </text>
                <text x="260" y="30" className="label" textAnchor="middle">
                  Shiosaki Pier
                </text>
                <text x="420" y="30" className="label" textAnchor="middle">
                  Charter 03
                </text>
                <text x="620" y="30" className="label" textAnchor="middle">
                  Eterveil Island
                </text>
                <text x="780" y="30" className="label" textAnchor="middle">
                  Hotel
                </text>

                {/* sub labels (bottom) */}
                <text x="150" y="86" className="sub" textAnchor="middle">
                  to bay
                </text>
                <text x="340" y="86" className="sub" textAnchor="middle">
                  anonymous ticket
                </text>
                <text x="520" y="86" className="sub" textAnchor="middle">
                  by sea
                </text>
                <text x="700" y="86" className="sub" textAnchor="middle">
                  arrival
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* ACCESS INFORMATION Popup */}
        {isAccessInfoOpen && (
          <div ref={accessInfoPopupRef} className={styles.accessInfoPopup}>
            <div className={styles.accessInfoPopupContent}>
              <Button
                variant="ghost"
                size="icon"
                className={styles.accessInfoCloseButton}
                onClick={handleMoreClick}
              >
                &times;
              </Button>
              <h2 className={styles.accessInfoPopupHeader}>
                ACCESS INFORMATION
              </h2>

              <div className={styles.accessInfoPopupBody}>
                {/* Location */}
                <div className={styles.accessInfoSection}>
                  <h3 className={styles.accessInfoTitle}>Location</h3>
                  <div className={styles.accessInfoText}>
                    <p className={styles.accessInfoLocationName}>
                      Eterveil Hotel
                    </p>
                    <p>1-8-3 Shiosaki, Higashi-kai Ward, Tokyo</p>
                    <p className={styles.accessInfoNote}>
                      (Registered coastal district, not shown on standard city
                      maps)
                    </p>
                  </div>
                </div>

                {/* Check-in Hours */}
                <div className={styles.accessInfoSection}>
                  <h3 className={styles.accessInfoTitle}>Check-in Hours</h3>
                  <div className={styles.accessInfoText}>
                    <p>Check-in/out:&nbspWhenever you are ready</p>
                  </div>
                </div>

                {/* How to reach us */}
                <div className={styles.accessInfoSection}>
                  <h3 className={styles.accessInfoTitle}>How to reach us</h3>
                  <div className={styles.accessInfoText}>
                    <p>From Tokyo Station</p>
                    <ul>
                      <li>Take the JR Keiyo Line toward the bay.</li>
                      <li>Get off at &quot;Shiosaki Pier&quot; station.</li>
                      <li>
                        Follow the signs for the shoreline and continue walking
                        until the city lights are no longer visible behind you.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Notes */}
                <div className={styles.accessInfoSection}>
                  <h3 className={styles.accessInfoTitle}>Notes</h3>
                  <ul className={styles.accessInfoNotes}>
                    <li>
                      Some navigation apps may point to a different shoreline.
                    </li>
                    <li>
                      If this happens, please continue toward the sea until your
                      signal begins to fade — you are almost here.
                    </li>
                    <li>Late-night or early-morning arrivals are welcome.</li>
                    <li>
                      For assistance, guests may contact the hotel at any time.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Fixed Buttons - disperseアニメーション対象外 */}
        <div
          ref={fixedButtonsRef}
          className={styles.fixedButtons}
          style={{ display: "none" }}
        >
          <Button variant="glass" size="md" onClick={handleExploreClick}>
            {buttonText}
          </Button>
        </div>
        <div className={styles.accessContainer}>
          <div className={styles.contentWrapper}></div>
        </div>
      </>
    );
  }
);

Access.displayName = "Access";
