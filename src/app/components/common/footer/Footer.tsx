"use client";

import Link from "next/link";
import styles from "./styles.module.scss";
import { CATCH_COPY_EN, HOTEL_NAME, MENU_ITEMS } from "../constants";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer}`}>
      <div className={`${styles.footerContent}`}>
        <div className={`${styles.footerSection}`}>
          <h3 className={`${styles.footerTitle}`}>{HOTEL_NAME}</h3>
          <p className={`${styles.footerDescription}`}>{CATCH_COPY_EN}</p>
        </div>

        <div className={`${styles.footerSection}`}>
          <h4 className={`${styles.footerSubtitle}`}>サイトマップ</h4>
          <ul className={`${styles.footerLinks}`}>
            {MENU_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.footerSection}`}>
          <h4 className={`${styles.footerSubtitle}`}>お問い合わせ</h4>
          <div className={`${styles.contactInfo}`}>
            <p>
              <strong>電話:</strong>
              <a href="tel:09012345678">090-1234-5678</a>
            </p>
            <p>
              <strong>住所:</strong>
              〒104-0031 東京都中央区京橋3-1-1
            </p>
          </div>
        </div>
      </div>

      <div className={`${styles.footerBottom}`}>
        <div className={`${styles.footerLinksBottom}`}>
          <Link href="/">プライバシーポリシー</Link>
          <span className={`${styles.separator}`}>|</span>
          <Link href="/">利用規約</Link>
          <span className={`${styles.separator}`}>|</span>
          <Link href="/">お問い合わせ</Link>
        </div>
        <p className={`${styles.copyright}`}>
          &copy; {currentYear} HORROR HOTEL. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
