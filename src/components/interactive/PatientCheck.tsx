"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppGet } from "@/components/interactive/AppGet";

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
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = useSyncExternalStore(noSubscription, () => `${window.location.origin}/patients#quick-check`, () => "/patients#quick-check");
  const sleepDone = answers.slice(0, 8).every((answer) => answer !== null);
  const jawDone = answers.slice(8).every((answer) => answer !== null);
  const sleep = answers.slice(0, 8).filter(Boolean).length;
  const jaw = answers.slice(8).filter(Boolean).length;
  const message = `I care about how you sleep. This 2-minute check could tell us if it’s worth looking into. ${shareUrl}`;

  function update(index: number, value: boolean) {
    setAnswers((previous) => previous.map((answer, i) => (i === index ? value : answer)));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="quick-check" className="spotlight section-y relative overflow-clip bg-ink text-paper">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div data-aos="fade-up" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="t-h2">Quick check: could it be sleep apnea or TMD?</h2>
          <p className="mt-6 t-lead text-paper/65">2 minutes. 12 yes/no questions. Not a diagnosis, just a sign of whether it’s worth getting checked.</p>
        </div>
        <div data-morph-shape="rect" data-aos="fade-up" data-aos-delay="100" className="rounded-[var(--radius-panel)] border border-paper/15 bg-paper/[0.04] p-6 sm:p-9">
          <form onSubmit={(event) => event.preventDefault()}>
            <fieldset>
              <legend className="t-eyebrow text-breath">Part 1: Sleep</legend>
              <div className="mt-5 space-y-5">{questions.slice(0, 8).map((question, index) => <Question key={question} index={index} question={question} value={answers[index]} onChange={update} />)}</div>
            </fieldset>
            <fieldset className="mt-10">
              <legend className="t-eyebrow text-breath">Part 2: Jaw</legend>
              <div className="mt-5 space-y-5">{questions.slice(8).map((question, offset) => <Question key={question} index={offset + 8} question={question} value={answers[offset + 8]} onChange={update} />)}</div>
            </fieldset>
          </form>
          {(sleepDone || jawDone) && (
            <div role="status" aria-label="Your awareness check results" className="mt-8 space-y-5 rounded-2xl border border-breath/30 bg-breath/10 p-5">
              <h3 className="t-h3">What Your Answers Reveal</h3>
              <p className="text-sm text-paper/75">These answers can help you prepare for a conversation with a qualified provider.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {sleepDone && (
                  <div className="rounded-2xl bg-paper/10 p-5">
                    <p className="t-eyebrow text-breath">Sleep</p>
                    <p className="mt-3 leading-relaxed">{sleep >= 3 ? "Worth checking. Your answers suggest signs often linked with sleep apnea. A Beyonn provider can help you find out for sure, often with a simple home sleep test." : "Lower likelihood. Your answers don’t point strongly to sleep apnea. If something still feels off, a check-up is always worthwhile."}</p>
                  </div>
                )}
                {jawDone && (
                  <div className="rounded-2xl bg-paper/10 p-5">
                    <p className="t-eyebrow text-breath">Jaw</p>
                    <p className="mt-3 leading-relaxed">{jaw >= 2 ? "Worth checking. Your answers suggest signs often linked with TMD. A Beyonn provider can look at your jaw and your airway together." : "Lower likelihood. Your answers don’t point strongly to TMD."}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn--dawn" href="/patients/find-a-provider">
                  <span>Find a Beyonn Provider Near You</span>
                </Link>
                <AppGet label="Get the Full Snore Score in the App" screen="snore-score" variant="ghost-light" />
              </div>
              <p className="text-sm text-paper/50">This check is for general information only and isn’t a medical diagnosis. Only a qualified provider can diagnose sleep apnea or TMD.</p>
            </div>
          )}
          <div className="mt-10 border-t border-paper/15 pt-6">
            <h3 className="t-h3">Worried about someone’s snoring?</h3>
            <p className="mt-2 text-paper/70">Partners often notice the signs first, and they’re often the reason someone finally gets checked.</p>
            <button type="button" className="btn btn--light btn--sm mt-5" aria-expanded={sharing} onClick={() => setSharing((open) => !open)}>
              <span>Send this to someone you love</span>
            </button>
            {sharing && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <a className="underline" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener">WhatsApp</a>
                <a className="underline" href={`sms:?body=${encodeURIComponent(message)}`}>SMS</a>
                <a className="underline" href={`mailto:?body=${encodeURIComponent(message)}`}>Email</a>
                <button type="button" className="underline" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Question({ index, question, value, onChange }: { index: number; question: string; value: boolean | null; onChange: (index: number, value: boolean) => void }) {
  return <div className="border-b border-paper/10 pb-5"><p id={`check-q-${index}`} className="leading-relaxed">{index + 1}. {question}</p><div className="mt-3 flex gap-2" role="radiogroup" aria-labelledby={`check-q-${index}`}>{[true, false].map((choice) => <label key={String(choice)} className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${value === choice ? "border-dawn bg-dawn text-white" : "border-paper/20 text-paper/70 hover:border-paper/60"}`}><input type="radio" className="sr-only" name={`check-${index}`} checked={value === choice} onChange={() => onChange(index, choice)} />{choice ? "Yes" : "No"}</label>)}</div></div>;
}
