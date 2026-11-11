"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { workshopContent } from "@/content/workshop";
import styles from "./WorkshopReminder.module.css";

const dismissalKey = "beyonn-workshop-reminder:ws-1dec";
const registrationUrl = workshopContent.registrationUrl.replace("workshop-section", "floating-card");

/** A quiet reminder once the home hero has passed, outside the main workshop section. */
export function WorkshopReminder() {
  const [pastHero, setPastHero] = useState(false);
  const [workshopVisible, setWorkshopVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(dismissalKey)) return; } catch { /* Dismissal still works for this visit. */ }
    const hero = document.querySelector('[data-guide="hero"]');
    if (!hero) return;
    const workshop = document.getElementById("workshop");
    const footer = document.querySelector("footer");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
        if (entry.target === workshop) setWorkshopVisible(entry.isIntersecting);
        if (entry.target === footer) setFooterVisible(entry.isIntersecting);
      }
    });
    observer.observe(hero);
    if (workshop) observer.observe(workshop);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(dismissalKey, "1"); } catch { /* Private browsing may disable storage. */ }
  };

  if (!pastHero || workshopVisible || footerVisible || dismissed) return null;

  return (
    <aside className={styles.reminder} aria-label="Free live workshop reminder">
      <div className={styles.picture}>
        <Image src="/assets/workshop/rod-invite.webp" alt="Dr. Rod Willey inviting you to the OSA and TMD workshop" width={640} height={320} sizes="(min-width: 640px) 320px, 280px" className={styles.image} />
      </div>
      <p className={styles.badge}>Free live workshop</p>
      <button type="button" onClick={dismiss} className={styles.close} aria-label="Dismiss workshop reminder"><span><X size={16} aria-hidden /></span></button>
      <div className={styles.body}>
        <h2 className={styles.title}>OSA + TMD Workshop with Dr. Rod Willey</h2>
        <p className={styles.schedule}><time dateTime="2026-12-01">Tue 1 Dec</time> · 9 AM or 7 PM CT</p>
        <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className={styles.button} aria-label="Reserve my seat (opens in a new tab)">Reserve my seat</a>
      </div>
    </aside>
  );
}
