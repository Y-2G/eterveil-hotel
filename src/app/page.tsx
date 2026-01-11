"use client";

import { Hero } from "./components/home/hero/Hero";
import { Concept } from "./components/home/concept/Concept";
import { Header } from "./components/common/header/Header";
import { Footer } from "./components/common/footer/Footer";
import { Canvas } from "./components/home/three/Canvas";

import { useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Access, AccessRef } from "./components/home/access/Access";
import { useDebugConfig } from "./hooks/useDebugConfig";
import { Contact } from "./components/home/contact/Contact";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { config, setConfig } = useDebugConfig();
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(false);
  const accessSectionRef = useRef<AccessRef>(null);

  const toggleOrbitControls = useCallback(() => {
    setOrbitControlsEnabled((prev) => !prev);
  }, []);

  const handleMapPinClick = useCallback(() => {
    accessSectionRef.current?.handleMoreClick();
  }, []);

  useEffect(() => {
    // Fade アニメーション
    const elements = gsap.utils.toArray<HTMLElement>(".fade-target");
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <Canvas
        debugConfig={config}
        zIndex={1}
        orbitControlsEnabled={orbitControlsEnabled}
        onMapPinClick={handleMapPinClick}
      />
      <Header />
      <main style={{ minHeight: "500vh" }}>
        <section id="hero">
          <Hero />
        </section>
        <section id="concept">
          <Concept debugConfig={config} setDebugConfig={setConfig} />
        </section>
        <section id="access">
          <Access
            ref={accessSectionRef}
            orbitControlsEnabled={orbitControlsEnabled}
            onToggleOrbitControls={toggleOrbitControls}
          />
        </section>
        <div
          id="transition-spacer"
          style={{ height: "100svh" }}
          aria-hidden="true"
        />
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </>
  );
}
