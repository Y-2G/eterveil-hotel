"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NextImage from "next/image";
import styles from "./styles.module.scss";
import classNames from "classnames";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  className: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
};

export const ParallaxImage = ({ className, ...nextImageProsp }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !innerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { yPercent: -20 },
        {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, wrapperRef);

    // アンマウント時に破棄
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={classNames(className, `${styles.parallaxWrapper}`)}
    >
      <div ref={innerRef} className={classNames(`${styles.parallaxInner}`)}>
        <NextImage {...nextImageProsp} />
      </div>
    </div>
  );
};
