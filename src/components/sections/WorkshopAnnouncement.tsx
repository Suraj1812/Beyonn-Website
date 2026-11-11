"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, X } from "lucide-react";
import styles from "./WorkshopAnnouncement.module.css";

const registrationUrl = "https://go.beyonn.com/dental-sleep-medicine-webinar?utm_source=website&utm_medium=homepage&utm_campaign=ws-1dec&utm_content=top-bar";

export function WorkshopAnnouncement() {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    const intro = document.querySelector(".intro");
    const animations = intro?.getAnimations().filter((animation) => animation.playState === "running" || animation.pending) ?? [];
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!disposed) setReady(true);
    });
    return () => { disposed = true; };
  }, []);
  if (dismissed) return null;
  return (
    <aside aria-label="Upcoming workshop" className={styles.announcement} data-workshop-ready={ready}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p data-workshop-reveal style={{ animationDelay: "60ms" }} className={styles.eyebrow}><span aria-hidden />Free live workshop</p>
            <p data-workshop-reveal style={{ animationDelay: "120ms" }} className={styles.title}>OSA + TMD Workshop <span>with Dr. Rod Willey</span></p>
          </div>
          <p data-workshop-reveal style={{ animationDelay: "180ms" }} className={styles.schedule}><time dateTime="2026-12-01">Tue 1 Dec</time><span>9 AM or 7 PM CT</span></p>
          <div data-workshop-reveal style={{ animationDelay: "240ms" }} className={styles.action}>
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer" aria-label="Reserve my seat (opens in a new tab)" className={styles.button}>Reserve my seat<span className={styles.arrow}><CalendarCheck2 className="size-4" strokeWidth={1.75} aria-hidden /></span></a>
          </div>
          <button type="button" aria-label="Dismiss workshop announcement" onClick={() => setDismissed(true)} className={styles.dismiss}><X className="size-4" aria-hidden /></button>
        </div>
      </div>
    </aside>
  );
}
