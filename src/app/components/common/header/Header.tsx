"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import { HOTEL_NAME, MENU_ITEMS } from "../constants";
import { Logo } from "../../atoms/Logo";

type ThemeType = "light" | "dark";

export const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeType>("light");

  // モーダル開閉時に背景スクロールをロック/解除
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // スクロール時にヘッダーのテーマを変更
  useEffect(() => {
    const handleScroll = () => {
      // 各セクションの位置を確認
      const heroSection = document.getElementById("hero");
      const conceptSection = document.getElementById("concept");

      if (!heroSection || !conceptSection) return;

      const heroRect = heroSection.getBoundingClientRect();
      const conceptRect = conceptSection.getBoundingClientRect();

      // Hero セクションが画面に表示されていればライトテーマ（白テキスト）
      if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
        setTheme("light");
      } else if (conceptRect.top < 0) {
        // Concept 以降はダークテーマ（黒テキスト）
        setTheme("dark");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // メニューリンククリック時にモーダルを閉じる
  const handleMenuClick = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className={`${styles.header} ${styles[theme]}`}>
        <div className={`${styles.headerContent}`}>
          {/* タイトル */}
          <Link href="/" className={`${styles.title}`}>
            <Logo width={40} />
            <span>{HOTEL_NAME}</span>
          </Link>

          {/* PC用メニュー */}
          <nav className={`${styles.pcMenu}`}>
            <ul className={`${styles.menuList}`}>
              {MENU_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={`${styles.menuLink}`}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* SP用メニューボタン */}
          <button
            className={`${styles.menuButton}`}
            onClick={() => setIsModalOpen(!isModalOpen)}
            aria-label="メニュー"
          >
            <span
              className={`${styles.hamburger} ${
                isModalOpen ? styles.active : ""
              }`}
            >
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* SP用モーダルメニュー */}
      {isModalOpen && (
        <div
          className={`${styles.modalOverlay}`}
          onClick={() => setIsModalOpen(false)}
        >
          <nav
            className={`${styles.modalMenu}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`${styles.closeButton}`}
              onClick={() => setIsModalOpen(false)}
              aria-label="メニューを閉じる"
            >
              ✕
            </button>
            <ul className={`${styles.modalMenuList}`}>
              {MENU_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`${styles.modalMenuLink}`}
                    onClick={handleMenuClick}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};
