"use client";

import { Heading } from "../../atoms/heading/Heading";
import styles from "./styles.module.scss";
import classNames from "classnames";
import { CATCH_COPY_EN, CATCH_COPY_JA } from "../../common/constants";
import { DebugGUI } from "../../common/DebugGUI";
import { facilities } from "../../common/facility/facilities";
import { FacilityDetails } from "../../common/facility/FacilityDetails";
import { DebugConfig } from "../three/types";
import { Dispatch, SetStateAction } from "react";

type Props = {
  debugConfig: DebugConfig;
  setDebugConfig: Dispatch<SetStateAction<DebugConfig>>;
};

export const Concept = ({ debugConfig, setDebugConfig }: Props) => {
  return (
    <>
      <DebugGUI sceneConfig={debugConfig} setSceneConfig={setDebugConfig} />
      <div id="concept" className={classNames(styles.concept)}>
        {/* フェーズ1：フルスクリーンCanvas - ピン留め対象 */}
        <div
          id="divA"
          style={{
            position: "relative",
            minHeight: "200vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff",
            zIndex: 2,
          }}
        >
          <Heading as="h2" isUnderLined={true} className="fade-target">
            CONCEPT
          </Heading>
          <p className={classNames(styles.cathcCopyEn, "fade-target")}>
            {CATCH_COPY_EN}
          </p>
          <p className={classNames(styles.cathcCopyJa, "fade-target")}>
            {CATCH_COPY_JA}
          </p>
          <div className={classNames(styles.description)}>
            <p className="fade-target">
              ETERVEIL HOTEL is an ocean-mist retreat where silence is treated
              as a luxury.
            </p>
            <p className="fade-target">
              Every suite opens toward the horizon. Morning light glides across
              the floor; at night, the tide breathes
            </p>
            <p className="fade-target">
              On nights when the sea lies calm, a tower appears through a break
              in the fog—ETERVEIL HOTEL. Here, plans and deadlines strangely
              lose their meaning, and only what you feel now remains certain.
            </p>
            <p className="fade-target">
              If you find yourself wanting to extend your stay, there&apos;s no
              need to worry. If you wish it, your room will always be made
              ready.
            </p>
            <p className="fade-target">
              The day you leave is decided not by you, but by the hotel.
            </p>
          </div>
        </div>

        {/* フェーズ2：詳細コンテンツ表示 */}
        <div
          id="divB"
          className={classNames(styles.detailPhase)}
          style={{
            position: "relative",
            display: "flex",
            zIndex: 1,
            opacity: 1,
            paddingTop: "100px",
            paddingBottom: "200svh",
          }}
        >
          <div className="b-left" style={{ flex: "0 0 40vw" }} />
          <div
            className={classNames(`${styles["b-content"]}`, "b-content")}
            style={{
              flex: "1",
              padding: "10vh 5vw",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {facilities.map((v, i) => (
              <FacilityDetails key={i} facility={v} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
