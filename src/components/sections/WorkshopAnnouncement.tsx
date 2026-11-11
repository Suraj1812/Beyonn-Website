"use client";

import { useState } from "react";
import { CalendarCheck2, X } from "lucide-react";
import styles from "./WorkshopAnnouncement.module.css";

const registrationUrl = "https://go.beyonn.com/dental-sleep-medicine-webinar?utm_source=website&utm_medium=homepage&utm_campaign=ws-1dec&utm_content=top-bar";

export function WorkshopAnnouncement() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside aria-label="Upcoming workshop" className={styles.announcement}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p data-aos="fade-up" data-aos-duration="650" data-aos-delay="60" className={styles.eyebrow}><span aria-hidden />Free live workshop</p>
            <p data-aos="fade-up" data-aos-duration="700" data-aos-delay="120" className={styles.title}>OSA + TMD Workshop <span>with Dr. Rod Willey</span></p>
          </div>
          <p data-aos="fade-up" data-aos-duration="700" data-aos-delay="180" className={styles.schedule}><time dateTime="2026-12-01">Tue 1 Dec</time><span>9 AM or 7 PM CT</span></p>
          <div data-aos="fade-up" data-aos-duration="700" data-aos-delay="240" className={styles.action}>
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer" aria-label="Reserve my seat (opens in a new tab)" className={styles.button}>Reserve my seat<span className={styles.arrow}><CalendarCheck2 className="size-4" strokeWidth={1.75} aria-hidden /></span></a>
          </div>
          <button type="button" aria-label="Dismiss workshop announcement" onClick={() => setDismissed(true)} className={styles.dismiss}><X className="size-4" aria-hidden /></button>
        </div>
      </div>
    </aside>
  );
}
