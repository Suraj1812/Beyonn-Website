"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const questions = [
  "Do you snore loudly, loud enough to be heard through a closed door?",
  "Do you often feel tired or sleepy during the day?",
  "Has anyone seen you stop breathing, choke or gasp in your sleep?",
  "Do you have high blood pressure, or take medicine for it?",
  "Do you wake up with headaches?",
  "Do you wake up often at night to use the bathroom?",
  "Are you over 50?",
  "Is your neck size over 16 inches (40 cm)?",
  "Do you have pain in your jaw, temple or in front of your ear?",
  "Does your jaw click, pop or lock when you open or chew?",
  "Do you clench or grind your teeth, or wake with a sore jaw?",
  "Has a night guard not solved your jaw pain or headaches?",
];

const noSubscription = () => () => {};

export function PatientCheck() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(12).fill(null));
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = useSyncExternalStore(noSubscription, () => `${window.location.origin}/patients#quick-check`, () => "/patients#quick-check");
  const complete = answers.every((answer) => answer !== null);
  const sleep = answers.slice(0, 8).filter(Boolean).length;
  const jaw = answers.slice(8).filter(Boolean).length;
  const shareText = "I care about how you sleep. This two-minute check could tell us whether it's worth looking into.";


  function update(index: number, value: boolean) {
    setAnswers((previous) => previous.map((answer, i) => i === index ? value : answer));
    setShow(false);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(`${shareText} ${shareUrl}`); setCopied(true); }
    catch { setCopied(false); }
  }

  return <section id="quick-check" className="spotlight section-y relative overflow-clip bg-ink text-paper"><div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
    <div data-aos="fade-up" className="lg:sticky lg:top-28 lg:self-start"><p className="t-eyebrow text-breath">Two-minute check</p><h2 className="mt-5 t-h2">Could it be sleep apnea or TMD?</h2><p className="mt-6 t-lead text-paper/65">Twelve yes-or-no questions. Your answers stay in this browser and are not sent to Beyonn.</p><p className="mt-6 text-sm text-paper/50">This check is for general information only. It cannot diagnose sleep apnea or TMD.</p></div>
    <div data-aos="fade-up" data-aos-delay="100" className="rounded-[var(--radius-panel)] border border-paper/15 bg-paper/[0.04] p-6 sm:p-9">
      <form onSubmit={(event) => { event.preventDefault(); if (complete) setShow(true); }}>
        <fieldset><legend className="t-eyebrow text-breath">Part 1 · Sleep</legend><div className="mt-5 space-y-5">{questions.slice(0, 8).map((question, index) => <Question key={question} index={index} question={question} value={answers[index]} onChange={update} />)}</div></fieldset>
        <fieldset className="mt-10"><legend className="t-eyebrow text-breath">Part 2 · Jaw</legend><div className="mt-5 space-y-5">{questions.slice(8).map((question, offset) => <Question key={question} index={offset + 8} question={question} value={answers[offset + 8]} onChange={update} />)}</div></fieldset>
        <button type="submit" className="btn btn--dawn mt-9" disabled={!complete}><span>See my results</span></button>
        {!complete && <p className="mt-3 text-sm text-paper/50">Answer every question to see your results.</p>}
      </form>
      {show && <div role="status" className="mt-10 space-y-5 border-t border-paper/15 pt-8"><h3 className="t-h3">Your results</h3><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-paper/10 p-5"><p className="t-eyebrow text-breath">Sleep · {sleep} yes</p><p className="mt-3 leading-relaxed">{sleep >= 3 ? "Worth checking. Your answers suggest signs often linked with sleep apnea. A provider can help you find out for sure." : "Lower likelihood. Your answers do not point strongly to sleep apnea. If something still feels off, a check-up is worthwhile."}</p></div><div className="rounded-2xl bg-paper/10 p-5"><p className="t-eyebrow text-breath">Jaw · {jaw} yes</p><p className="mt-3 leading-relaxed">{jaw >= 2 ? "Worth checking. Your answers suggest signs often linked with TMD. A provider can look at your jaw and airway together." : "Lower likelihood. Your answers do not point strongly to TMD."}</p></div></div><Link className="btn btn--dawn" href="/patients/find-a-provider"><span>Find a provider</span></Link></div>}
      <div className="mt-10 border-t border-paper/15 pt-6"><p className="font-semibold">Worried about someone&apos;s snoring?</p><p className="mt-2 text-sm text-paper/60">Share this check with someone you care about.</p><div className="mt-4 flex flex-wrap gap-3 text-sm"><a className="underline" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`} target="_blank" rel="noopener">WhatsApp</a><a className="underline" href={`sms:?body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}>SMS</a><a className="underline" href={`mailto:?subject=${encodeURIComponent("A quick sleep and jaw check")}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}>Email</a><button type="button" className="underline" onClick={copy}>{copied ? "Copied" : "Copy link"}</button></div></div>
    </div>
  </div></section>;
}

function Question({ index, question, value, onChange }: { index: number; question: string; value: boolean | null; onChange: (index: number, value: boolean) => void }) {
  return <div className="border-b border-paper/10 pb-5"><p id={`check-q-${index}`} className="leading-relaxed">{index + 1}. {question}</p><div className="mt-3 flex gap-2" role="radiogroup" aria-labelledby={`check-q-${index}`}>{[true, false].map((choice) => <label key={String(choice)} className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${value === choice ? "border-dawn bg-dawn text-white" : "border-paper/20 text-paper/70 hover:border-paper/60"}`}><input type="radio" className="sr-only" name={`check-${index}`} checked={value === choice} onChange={() => onChange(index, choice)} />{choice ? "Yes" : "No"}</label>)}</div></div>;
}
