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

export const ConceptSection = ({ debugConfig, setDebugConfig }: Props) => {
  return (
    <>
      <DebugGUI sceneConfig={debugConfig} setSceneConfig={setDebugConfig} />
      <section id="concept" className={classNames(styles.concept)}>
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
          <p className={classNames(`${styles.paragraph}`)}>{CATCH_COPY_EN}</p>
          <p className={classNames(`${styles.paragraph}`)}>{CATCH_COPY_JA}</p>
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
      </section>
    </>
  );
};
