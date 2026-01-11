"use client";

import { HeroSection } from "./components/home/hero/HeroSection";
import { ConceptSection } from "./components/home/concept/ConceptSection";
import { Header } from "./components/common/header/Header";
import { Footer } from "./components/common/footer/Footer";
import { Canvas } from "./components/home/three/Canvas";

import { useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AccessSection, AccessSectionRef } from "./components/home/access/AccessSection";
import { ContactSection } from "./components/home/contact/ContactSection";
import { useDebugConfig } from "./hooks/useDebugConfig";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { config, setConfig } = useDebugConfig();
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(false);
  const accessSectionRef = useRef<AccessSectionRef>(null);

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
          <HeroSection />
        </section>
        <section id="concept">
          <ConceptSection debugConfig={config} setDebugConfig={setConfig} />
        </section>
        <section id="access">
          <AccessSection
            ref={accessSectionRef}
            orbitControlsEnabled={orbitControlsEnabled}
            onToggleOrbitControls={toggleOrbitControls}
          />
        </section>
        <section
          id="transition-spacer"
          style={{ height: "100svh" }}
          aria-hidden="true"
        />
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      <Footer />
    </>
  );
}
