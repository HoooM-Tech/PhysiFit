'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Fraunces, IBM_Plex_Mono } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-fraunces',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export default function InvestPage() {
  useEffect(() => {
    // Scroll reveal animation
    const revealEls = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    revealEls.forEach((el) => io.observe(el))

    // Raise progress bar animation
    const raiseTrack = document.querySelector('.raise-bar-track')
    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            io2.unobserve(e.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    if (raiseTrack) io2.observe(raiseTrack)

    // Ramp chart bars animation
    const rampChart = document.getElementById('rampChart')
    const io3 = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll('.ramp-bar').forEach((bar) => {
              const htmlBar = bar as HTMLElement
              htmlBar.style.height = htmlBar.style.getPropertyValue('--target')
            })
            io3.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    if (rampChart) io3.observe(rampChart)

    return () => {
      io.disconnect()
      io2.disconnect()
      if (rampChart) io3.disconnect()
    }
  }, [])

  return (
    <div className={`${fraunces.variable} ${ibmPlexMono.variable} invest-root`}>
      <style jsx global>{`
        .invest-root {
          --navy: #0f0d2e; /* PhysiFit Primary Darker */
          --navy-soft: #1f1b5e; /* PhysiFit Primary Dark */
          --paper: #F4F6F5;
          --paper-dim: #E9EDEC;
          --cyan: #d4a500; /* PhysiFit Accent Gold */
          --sky: #6589C3;
          --orange: #D06714;
          --ink: #0f0d2e;
          --ink-soft: rgba(15, 13, 46, 0.62);
          --line: rgba(15, 13, 46, 0.12);
          --line-dark: rgba(244, 246, 245, 0.14);
          
          font-family: var(--font-sans), sans-serif;
          color: var(--ink);
          background: var(--paper);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }

        .invest-root * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .invest-root .serif {
          font-family: var(--font-fraunces), serif;
        }

        .invest-root .mono {
          font-family: var(--font-mono), monospace;
        }

        .invest-root a {
          color: inherit;
        }

        .invest-root img {
          max-width: 100%;
          display: block;
        }

        .invest-root .wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 32px;
        }

        @media (max-width: 720px) {
          .invest-root .wrap {
            padding: 0 22px;
          }
        }

        /* ---------- Eyebrow / labels ---------- */
        .invest-root .eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ---------- Nav ---------- */
        .invest-root header.nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(15, 13, 46, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--line-dark);
        }

        .invest-root .nav-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 720px) {
          .invest-root .nav-inner {
            padding: 16px 22px;
          }
        }

        .invest-root nav.links {
          display: flex;
          gap: 30px;
          align-items: center;
        }

        .invest-root nav.links a {
          color: rgba(244, 246, 245, 0.74);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .invest-root nav.links a:hover,
        .invest-root nav.links a:focus-visible {
          color: #F4F6F5;
        }

        .invest-root .nav-cta {
          background: var(--cyan);
          color: var(--navy) !important;
          padding: 9px 18px;
          border-radius: 3px;
          font-weight: 600;
          font-size: 13px !important;
        }

        .invest-root .nav-cta:hover {
          background: #e6b81f;
        }

        @media (max-width: 880px) {
          .invest-root nav.links a:not(.nav-cta) {
            display: none;
          }
        }

        .invest-root a:focus-visible,
        .invest-root button:focus-visible {
          outline: 2px solid var(--cyan);
          outline-offset: 3px;
        }

        /* ---------- Hero ---------- */
        .invest-root .hero {
          background: radial-gradient(
              ellipse 900px 500px at 12% -10%,
              rgba(212, 165, 0, 0.12),
              transparent 60%
            ),
            radial-gradient(
              ellipse 700px 500px at 100% 10%,
              rgba(208, 103, 20, 0.08),
              transparent 55%
            ),
            var(--navy);
          color: #F4F6F5;
          padding: 108px 0 90px;
          position: relative;
          overflow: hidden;
        }

        .invest-root .hero-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(244, 246, 245, 0.16) 20%,
            rgba(244, 246, 245, 0.16) 80%,
            transparent
          );
          display: none;
        }

        @media (min-width: 980px) {
          .invest-root .hero-divider {
            display: block;
          }
        }

        .invest-root .hero-inner {
          max-width: 760px;
        }

        .invest-root .hero .eyebrow {
          color: var(--cyan);
          margin-bottom: 22px;
          display: block;
        }

        .invest-root .hero h1 {
          font-size: clamp(36px, 5.4vw, 62px);
          font-weight: 500;
          line-height: 1.06;
          letter-spacing: -0.01em;
          margin-bottom: 24px;
        }

        .invest-root .hero h1 em {
          font-style: italic;
          font-weight: 400;
          color: var(--cyan);
        }

        .invest-root .hero p.lede {
          font-size: 18px;
          color: rgba(244, 246, 245, 0.72);
          max-width: 540px;
          margin-bottom: 40px;
        }

        .invest-root .hero-cta-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 64px;
        }

        .invest-root .btn {
          display: inline-block;
          padding: 13px 26px;
          border-radius: 3px;
          font-weight: 600;
          font-size: 14.5px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .invest-root .btn-primary {
          background: var(--cyan);
          color: var(--navy);
        }

        .invest-root .btn-primary:hover {
          background: #e6b81f;
          transform: translateY(-1px);
        }

        .invest-root .btn-ghost {
          border-color: rgba(244, 246, 245, 0.3);
          color: #F4F6F5;
        }

        .invest-root .btn-ghost:hover {
          border-color: #F4F6F5;
          background: rgba(244, 246, 245, 0.06);
        }

        .invest-root .raise-card {
          background: rgba(244, 246, 245, 0.05);
          border: 1px solid rgba(244, 246, 245, 0.14);
          border-radius: 6px;
          padding: 28px 30px;
          max-width: 560px;
        }

        .invest-root .raise-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }

        .invest-root .raise-figure {
          font-family: var(--font-fraunces), serif;
          font-size: 34px;
          font-weight: 500;
          color: var(--cyan);
        }

        .invest-root .raise-label {
          font-size: 13px;
          color: rgba(244, 246, 245, 0.58);
        }

        .invest-root .raise-bar-track {
          height: 6px;
          border-radius: 3px;
          background: rgba(244, 246, 245, 0.14);
          overflow: hidden;
          margin-bottom: 12px;
        }

        .invest-root .raise-bar-fill {
          height: 100%;
          width: 0%;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--orange), var(--cyan));
          transition: width 1.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .invest-root .raise-bar-track.in-view .raise-bar-fill {
          width: 25%;
        }

        .invest-root .raise-foot {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: rgba(244, 246, 245, 0.58);
        }

        /* ---------- Section scaffolding ---------- */
        .invest-root section {
          padding: 96px 0;
        }

        @media (max-width: 720px) {
          .invest-root section {
            padding: 64px 0;
          }
        }

        .invest-root section.dark {
          background: var(--navy);
          color: #F4F6F5;
        }

        .invest-root section.light {
          background: var(--paper);
        }

        .invest-root .section-head {
          max-width: 680px;
          margin-bottom: 56px;
        }

        .invest-root .section-head .eyebrow {
          margin-bottom: 14px;
          display: block;
        }

        .invest-root .dark .eyebrow {
          color: var(--cyan);
        }

        .invest-root .light .eyebrow {
          color: var(--orange);
        }

        .invest-root .section-head h2 {
          font-size: clamp(28px, 3.6vw, 42px);
          font-weight: 500;
          line-height: 1.14;
          letter-spacing: -0.01em;
        }

        .invest-root .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .invest-root .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ---------- Problem: dual track split ---------- */
        .invest-root .track-split {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 0;
          border: 1px solid var(--line);
          border-radius: 8px;
          overflow: hidden;
        }

        @media (max-width: 760px) {
          .invest-root .track-split {
            grid-template-columns: 1fr;
          }
          .invest-root .track-split .divider-col {
            display: none;
          }
        }

        .invest-root .divider-col {
          background: var(--line);
        }

        .invest-root .track-col {
          padding: 38px 36px;
          background: #fff;
        }

        .invest-root .track-col.sky {
          border-top: 3px solid var(--sky);
        }

        .invest-root .track-col.orange {
          border-top: 3px solid var(--orange);
        }

        .invest-root .track-tag {
          font-family: var(--font-mono), monospace;
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 10px;
          display: block;
        }

        .invest-root .sky .track-tag {
          color: var(--sky);
        }

        .invest-root .orange .track-tag {
          color: var(--orange);
        }

        .invest-root .track-col h3 {
          font-family: var(--font-fraunces), serif;
          font-size: 23px;
          font-weight: 500;
          margin-bottom: 18px;
        }

        .invest-root .track-col ul {
          list-style: none;
        }

        .invest-root .track-col li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 13px;
          font-size: 14.5px;
          color: var(--ink-soft);
          line-height: 1.55;
        }

        .invest-root .track-col li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .invest-root .sky li::before {
          background: var(--sky);
        }

        .invest-root .orange li::before {
          background: var(--orange);
        }

        .invest-root .problem-foot {
          margin-top: 30px;
          font-size: 15px;
          color: var(--ink-soft);
          font-style: italic;
          font-family: var(--font-fraunces), serif;
        }

        /* ---------- Solution ---------- */
        .invest-root .solution-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 56px;
          align-items: start;
        }

        @media (max-width: 880px) {
          .invest-root .solution-grid {
            grid-template-columns: 1fr;
          }
        }

        .invest-root .feature-list {
          list-style: none;
          margin-top: 8px;
        }

        .invest-root .feature-list li {
          display: flex;
          gap: 14px;
          padding: 16px 0;
          border-top: 1px solid var(--line);
          font-size: 15px;
        }

        .invest-root .feature-list li:last-child {
          border-bottom: 1px solid var(--line);
        }

        .invest-root .feature-num {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: var(--ink-soft);
          padding-top: 2px;
        }

        .invest-root .pullquote-card {
          background: var(--navy);
          color: #F4F6F5;
          border-radius: 8px;
          padding: 40px 34px;
        }

        .invest-root .pullquote-card .stat {
          font-family: var(--font-fraunces), serif;
          font-size: 56px;
          font-weight: 500;
          color: var(--cyan);
          line-height: 1;
        }

        .invest-root .pullquote-card .stat-label {
          font-size: 14px;
          color: rgba(244, 246, 245, 0.66);
          margin: 10px 0 28px;
          max-width: 280px;
        }

        .invest-root .pullquote-card blockquote {
          font-family: var(--font-fraunces), serif;
          font-style: italic;
          font-size: 19px;
          line-height: 1.45;
          border-top: 1px solid rgba(244, 246, 245, 0.16);
          padding-top: 24px;
        }

        /* ---------- Why wins ---------- */
        .invest-root .wins-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--line-dark);
          border: 1px solid var(--line-dark);
          border-radius: 8px;
          overflow: hidden;
        }

        @media (max-width: 880px) {
          .invest-root .wins-grid {
            grid-template-columns: 1fr;
          }
        }

        .invest-root .wins-card {
          background: var(--navy-soft);
          padding: 36px 32px;
        }

        .invest-root .wins-card h3 {
          font-family: var(--font-fraunces), serif;
          font-size: 19px;
          font-weight: 500;
          margin-bottom: 14px;
          color: #F4F6F5;
        }

        .invest-root .wins-card p,
        .invest-root .wins-card li {
          font-size: 14px;
          color: rgba(244, 246, 245, 0.66);
          line-height: 1.6;
        }

        .invest-root .wins-card ul {
          list-style: none;
          margin-top: 6px;
        }

        .invest-root .wins-card li {
          padding: 6px 0;
          border-top: 1px solid var(--line-dark);
        }

        .invest-root .wins-card li:first-child {
          border-top: none;
        }

        .invest-root .wins-card .bignum {
          font-family: var(--font-fraunces), serif;
          font-size: 48px;
          color: var(--cyan);
          line-height: 1;
          margin-bottom: 8px;
        }

        /* ---------- Business model ---------- */
        .invest-root .price-card {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          align-items: baseline;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 30px 32px;
          margin-bottom: 56px;
        }

        .invest-root .price-figure {
          font-family: var(--font-fraunces), serif;
          font-size: 38px;
          font-weight: 500;
          color: var(--orange);
        }

        .invest-root .price-note {
          font-size: 14px;
          color: var(--ink-soft);
          max-width: 560px;
          line-height: 1.6;
        }

        .invest-root .ramp-chart {
          display: flex;
          align-items: flex-end;
          gap: 18px;
          height: 220px;
          margin-bottom: 14px;
          padding: 0 4px;
        }

        .invest-root .ramp-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
        }

        .invest-root .ramp-bar {
          width: 100%;
          max-width: 64px;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(180deg, var(--cyan), var(--sky));
          height: 0%;
          transition: height 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .invest-root .ramp-val {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          margin-bottom: 8px;
          color: var(--ink);
        }

        .invest-root .ramp-labels {
          display: flex;
          gap: 18px;
          padding: 0 4px;
        }

        .invest-root .ramp-label-col {
          flex: 1;
          text-align: center;
        }

        .invest-root .ramp-label-col .t {
          font-size: 13px;
          font-weight: 600;
        }

        .invest-root .ramp-label-col .m {
          font-size: 11.5px;
          color: var(--ink-soft);
          font-family: var(--font-mono), monospace;
        }

        .invest-root .at-capacity {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--line);
          border: 1px solid var(--line);
          border-radius: 8px;
          overflow: hidden;
          margin: 48px 0;
        }

        @media (max-width: 700px) {
          .invest-root .at-capacity {
            grid-template-columns: 1fr;
          }
        }

        .invest-root .at-cap-cell {
          background: #fff;
          padding: 28px 26px;
        }

        .invest-root .at-cap-cell .v {
          font-family: var(--font-fraunces), serif;
          font-size: 30px;
          color: var(--ink);
          margin-bottom: 6px;
        }

        .invest-root .at-cap-cell .l {
          font-size: 12.5px;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-mono), monospace;
        }

        .invest-root .rev-streams {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .invest-root .pill {
          border: 1px solid var(--line);
          border-radius: 30px;
          padding: 8px 18px;
          font-size: 13.5px;
          color: var(--ink-soft);
          background: #fff;
        }

        .invest-root .location-note {
          margin-top: 48px;
          font-size: 14.5px;
          color: var(--ink-soft);
          max-width: 640px;
          line-height: 1.65;
        }

        .invest-root .location-note strong {
          color: var(--ink);
        }

        /* ---------- Financial trajectory ---------- */
        .invest-root .traj-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        @media (max-width: 760px) {
          .invest-root .traj-grid {
            grid-template-columns: 1fr;
          }
        }

        .invest-root .traj-cell {
          border-top: 1px solid var(--line-dark);
          padding-top: 24px;
        }

        .invest-root .traj-cell .v {
          font-family: var(--font-fraunces), serif;
          font-size: clamp(30px, 3.4vw, 40px);
          color: var(--cyan);
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .invest-root .traj-cell .l {
          font-size: 14px;
          color: rgba(244, 246, 245, 0.66);
        }

        .invest-root .opex-note {
          margin-top: 48px;
          font-size: 13.5px;
          color: rgba(244, 246, 245, 0.52);
          max-width: 560px;
          line-height: 1.6;
          font-family: var(--font-mono), monospace;
        }

        /* ---------- Investment ---------- */
        .invest-root .invest-summary {
          background: rgba(244, 246, 245, 0.05);
          border: 1px solid rgba(244, 246, 245, 0.14);
          border-radius: 8px;
          padding: 36px 34px;
          margin-bottom: 56px;
        }

        .invest-root .funds-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }

        .invest-root .funds-table tr {
          border-bottom: 1px solid var(--line-dark);
        }

        .invest-root .funds-table tr:first-child {
          border-top: 1px solid var(--line-dark);
        }

        .invest-root .funds-table td {
          padding: 16px 4px;
          font-size: 14.5px;
        }

        .invest-root .funds-table td:first-child {
          color: rgba(244, 246, 245, 0.66);
        }

        .invest-root .funds-table td:last-child {
          font-family: var(--font-mono), monospace;
          text-align: right;
          color: #F4F6F5;
        }

        .invest-root .funds-table tr.total td {
          font-weight: 600;
          color: var(--cyan);
          font-size: 15.5px;
          border-top: 1px solid rgba(244, 246, 245, 0.3);
        }

        .invest-root .terms-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          background: var(--line-dark);
          border: 1px solid var(--line-dark);
          border-radius: 8px;
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .invest-root .terms-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 540px) {
          .invest-root .terms-grid {
            grid-template-columns: 1fr;
          }
        }

        .invest-root .term-cell {
          background: var(--navy-soft);
          padding: 24px 20px;
        }

        .invest-root .term-cell .l {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(244, 246, 245, 0.5);
          font-family: var(--font-mono), monospace;
          margin-bottom: 10px;
        }

        .invest-root .term-cell .v {
          font-family: var(--font-fraunces), serif;
          font-size: 18px;
          color: #F4F6F5;
          line-height: 1.3;
        }

        .invest-root .terms-note {
          margin-top: 24px;
          font-size: 13.5px;
          color: rgba(244, 246, 245, 0.56);
          max-width: 600px;
          line-height: 1.6;
        }

        /* ---------- Vision timeline ---------- */
        .invest-root .timeline {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1px solid var(--line);
        }

        @media (max-width: 760px) {
          .invest-root .timeline {
            grid-template-columns: 1fr;
          }
        }

        .invest-root .tl-cell {
          padding: 32px 28px 0;
          border-right: 1px solid var(--line);
        }

        .invest-root .tl-cell:last-child {
          border-right: none;
        }

        @media (max-width: 760px) {
          .invest-root .tl-cell {
            border-right: none;
            border-bottom: 1px solid var(--line);
            padding-bottom: 28px;
          }
        }

        .invest-root .tl-cell .num {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: var(--orange);
          margin-bottom: 10px;
        }

        .invest-root .tl-cell h3 {
          font-family: var(--font-fraunces), serif;
          font-size: 21px;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .invest-root .tl-cell p {
          font-size: 14.5px;
          color: var(--ink-soft);
          line-height: 1.6;
        }

        .invest-root .vision-statement {
          font-family: var(--font-fraunces), serif;
          font-style: italic;
          font-size: clamp(20px, 2.6vw, 26px);
          color: var(--ink);
          max-width: 680px;
          margin-bottom: 44px;
          line-height: 1.4;
        }

        /* ---------- CTA Footer ---------- */
        .invest-root .cta-footer {
          background: var(--navy);
          color: #F4F6F5;
          padding: 100px 0 50px;
          text-align: center;
        }

        .invest-root .cta-footer h2 {
          font-family: var(--font-fraunces), serif;
          font-size: clamp(30px, 4.6vw, 48px);
          font-weight: 500;
          margin-bottom: 20px;
        }

        .invest-root .cta-footer .sub {
          color: rgba(244, 246, 245, 0.66);
          font-size: 16px;
          max-width: 520px;
          margin: 0 auto 38px;
        }

        .invest-root .footer-cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 80px;
        }

        .invest-root .footer-bottom {
          border-top: 1px solid var(--line-dark);
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .invest-root .footer-meta {
          font-size: 12.5px;
          color: rgba(244, 246, 245, 0.42);
          max-width: 480px;
          line-height: 1.6;
          text-align: left;
        }
      `}</style>

      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/images/logo_dark.png"
              alt="PhysiFit Logo"
              width={140}
              height={38}
              className="object-contain h-9 w-auto"
              priority
            />
          </Link>
          <nav className="links">
            <a href="#problem">Problem</a>
            <a href="#solution">Solution</a>
            <a href="#model">Business Model</a>
            <a href="#invest">Investment</a>
            <a href="mailto:peter@hooom.org" className="nav-cta">
              Talk to us
            </a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-divider"></div>
        <div className="wrap">
          <div className="hero-inner">
            <span className="eyebrow">Active Aging · Postpartum Recovery · Lagos</span>
            <h1>
              The future of <em>active aging</em> & postpartum wellness in Africa.
            </h1>
            <p className="lede">
              A clinical-grade, premium wellness studio built for two groups traditional fitness has always overlooked — launching in Ikoyi, Lagos.
            </p>
            <div className="hero-cta-row">
              <a href="#invest" className="btn btn-primary">
                View the opportunity
              </a>
              <a
                href="mailto:peter@hooom.org?subject=Physifit%20Investment%20Inquiry"
                className="btn btn-ghost"
              >
                Get in touch
              </a>
            </div>
            <div className="raise-card">
              <div className="raise-top">
                <div>
                  <div className="raise-label">Seeking (remaining)</div>
                  <div className="raise-figure">NGN 300M</div>
                </div>
                <div className="raise-label" style={{ textAlign: 'right' }}>
                  of a NGN 400M round
                  <br />
                  NGN 100M already committed
                </div>
              </div>
              <div className="raise-bar-track">
                <div className="raise-bar-fill"></div>
              </div>
              <div className="raise-foot font-bold">
                <span>25% closed</span>
                <span>Peter Oshinowo — Exercise Science · 10+ yrs in fitness</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="light" id="problem">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">The Problem</span>
            <h2>Traditional fitness was never built for these two groups.</h2>
          </div>
          <div className="track-split reveal">
            <div className="track-col sky">
              <span className="track-tag">Track 01 — Seniors</span>
              <h3>Active Aging</h3>
              <ul>
                <li>Traditional gyms can feel intimidating and unsafe</li>
                <li>Programming is designed for younger populations</li>
                <li>Little sense of community among older adults</li>
                <li>Facilities rarely address mobility, balance, and age-related strength needs</li>
              </ul>
            </div>
            <div className="divider-col"></div>
            <div className="track-col orange">
              <span className="track-tag">Track 02 — Postpartum</span>
              <h3>Postpartum Women</h3>
              <ul>
                <li>Recovery is often guided by generalized fitness advice</li>
                <li>Many trainers lack expertise in postpartum rehabilitation</li>
                <li>Women struggle with core recovery and diastasis recti</li>
                <li>Breathing mechanics and rebuilding confidence go unaddressed</li>
              </ul>
            </div>
          </div>
          <p className="problem-foot reveal">Existing solutions are fragmented, inconsistent, and often ineffective.</p>
        </div>
      </section>

      <section className="light" id="solution" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">The Solution</span>
            <h2>A premium wellness destination, built specifically for active aging and postpartum recovery.</h2>
          </div>
          <div className="solution-grid reveal">
            <ul className="feature-list">
              <li>
                <span className="feature-num">01</span> Specialized fitness programming
              </li>
              <li>
                <span className="feature-num">02</span> Core restoration & postpartum recovery
              </li>
              <li>
                <span className="feature-num">03</span> Balance, mobility & functional strength
              </li>
              <li>
                <span className="feature-num">04</span> Nutrition support
              </li>
              <li>
                <span className="feature-num">05</span> Group wellness classes
              </li>
              <li>
                <span className="feature-num">06</span> Accountability & lifestyle coaching
              </li>
            </ul>
            <div className="pullquote-card">
              <div className="stat">60</div>
              <div className="stat-label">
                past personal training clients are already open to joining a physical studio — built-in early demand before doors even open.
              </div>
              <blockquote>We are building a place where people do not simply exercise. They belong.</blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Why Physifit Wins</span>
            <h2>Not another gym. Specialization is our advantage.</h2>
          </div>
          <div className="wins-grid reveal">
            <div className="wins-card">
              <h3>Founder-Led Expertise</h3>
              <ul>
                <li>10+ years as a fitness professional</li>
                <li>Degree in Exercise Science</li>
                <li>Deep understanding of movement, rehabilitation & coaching</li>
              </ul>
            </div>
            <div className="wins-card">
              <div className="bignum">60</div>
              <p>Past personal training clients already open to joining a physical studio.</p>
            </div>
            <div className="wins-card">
              <h3>Competitive Advantage</h3>
              <ul>
                <li>Specialized programming</li>
                <li>Safety-first approach</li>
                <li>Community-driven retention</li>
                <li>Premium wellness experience</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="light" id="model">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Business Model</span>
            <h2>A premium membership model, benchmarked and validated.</h2>
          </div>

          <div className="price-card reveal">
            <div className="price-figure">
              NGN 300,000
              <span style={{ fontSize: '16px', color: 'var(--ink-soft)' }}>/mo</span>
            </div>
            <div className="price-note">
              Membership fee — benchmarked against the founder's existing 1-on-1 rate (NGN 500K/mo) and comparable Lagos boutique studio pricing (NGN 300K+/mo); positioned as a premium group offering at a discount to private training.
            </div>
          </div>

          <div className="reveal">
            <h3 className="serif" style={{ fontSize: '19px', fontWeight: 500, marginBottom: '24px' }}>
              Membership Ramp — Year 1 to Year 2
            </h3>
            <div className="ramp-chart" id="rampChart">
              <div className="ramp-bar-col">
                <span className="ramp-val">NGN 9M</span>
                <div className="ramp-bar" style={{ '--target': '18%' } as React.CSSProperties}></div>
              </div>
              <div className="ramp-bar-col">
                <span className="ramp-val">NGN 21M</span>
                <div className="ramp-bar" style={{ '--target': '42%' } as React.CSSProperties}></div>
              </div>
              <div className="ramp-bar-col">
                <span className="ramp-val">NGN 30M</span>
                <div className="ramp-bar" style={{ '--target': '60%' } as React.CSSProperties}></div>
              </div>
              <div className="ramp-bar-col">
                <span className="ramp-val">NGN 39M</span>
                <div className="ramp-bar" style={{ '--target': '78%' } as React.CSSProperties}></div>
              </div>
              <div className="ramp-bar-col">
                <span className="ramp-val">NGN 45M</span>
                <div className="ramp-bar" style={{ '--target': '100%' } as React.CSSProperties}></div>
              </div>
            </div>
            <div className="ramp-labels">
              <div className="ramp-label-col">
                <div className="t">Month 1</div>
                <div className="m">30 members</div>
              </div>
              <div className="ramp-label-col">
                <div className="t">Month 6</div>
                <div className="m">70 members</div>
              </div>
              <div className="ramp-label-col">
                <div className="t">Month 12</div>
                <div className="m">100 members</div>
              </div>
              <div className="ramp-label-col">
                <div className="t">Month 18</div>
                <div className="m">130 members</div>
              </div>
              <div className="ramp-label-col">
                <div className="t">Month 24</div>
                <div className="m">150 members</div>
              </div>
            </div>
          </div>

          <div className="at-capacity reveal">
            <div className="at-cap-cell">
              <div className="v">150</div>
              <div className="l">Members at capacity</div>
            </div>
            <div className="at-cap-cell">
              <div className="v">NGN 45M</div>
              <div className="l">Monthly revenue at capacity</div>
            </div>
            <div className="at-cap-cell">
              <div className="v">NGN 540M</div>
              <div className="l">Annualized at capacity</div>
            </div>
          </div>

          <div className="reveal" style={{ marginTop: '48px' }}>
            <h3 className="serif" style={{ fontSize: '17px', fontWeight: 500, marginBottom: '16px' }}>
              Additional Revenue Streams
            </h3>
            <div className="rev-streams">
              <span className="pill">Nutrition programs</span>
              <span className="pill">Merchandise</span>
              <span className="pill">Wellness workshops</span>
              <span className="pill">Corporate wellness partnerships</span>
            </div>
          </div>

          <p className="location-note reveal">
            <strong>Launch location: Ikoyi, Lagos</strong> — concentration of affluent families, seniors, professionals, and postpartum women seeking premium wellness.
          </p>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Financial Trajectory</span>
            <h2>Breakeven by Month 3, scaling to strong cash flow by Year 2.</h2>
          </div>
          <div className="traj-grid reveal">
            <div className="traj-cell">
              <div className="v">Month 2–3</div>
              <div className="l">Breakeven</div>
            </div>
            <div className="traj-cell">
              <div className="v">NGN 70–90M</div>
              <div className="l">Year 1 net profit (est.)</div>
            </div>
            <div className="traj-cell">
              <div className="v">NGN 280–320M</div>
              <div className="l">Year 2 net profit (est.)</div>
            </div>
          </div>
          <p className="opex-note reveal">
            Steady-state monthly opex ≈ NGN 13.7M (rent, payroll, utilities & maintenance). Figures exclude additional revenue streams.
          </p>
        </div>
      </section>

      <section className="dark" id="invest" style={{ borderTop: '1px solid var(--line-dark)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">The Investment</span>
            <h2>Seeking NGN 300M to complete our NGN 400M round.</h2>
          </div>

          <div className="invest-summary reveal">
            <p style={{ fontSize: '14.5px', color: 'rgba(244,246,245,0.7)', marginBottom: '24px' }}>
              NGN 100M already committed — 25% of the NGN 400M target closed. Remaining ask: NGN 300M.
            </p>
            <table className="funds-table">
              <tbody>
                <tr>
                  <td>Rent (Year 1, upfront)</td>
                  <td>NGN 50M</td>
                </tr>
                <tr>
                  <td>Equipment</td>
                  <td>NGN 30M</td>
                </tr>
                <tr>
                  <td>Solar Infrastructure</td>
                  <td>NGN 40M</td>
                </tr>
                <tr>
                  <td>Marketing & Customer Acquisition</td>
                  <td>NGN 40M</td>
                </tr>
                <tr>
                  <td>Staffing (setup & ramp)</td>
                  <td>NGN 72M</td>
                </tr>
                <tr>
                  <td>Working Capital & Strategic Buffer</td>
                  <td>NGN 168M</td>
                </tr>
                <tr className="total">
                  <td>Total (Full Round)</td>
                  <td>NGN 400M</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="serif reveal" style={{ fontSize: '18px', fontWeight: 500, marginBottom: '20px', color: '#F4F6F5' }}>
            Investor Structure
          </h3>
          <div className="terms-grid reveal">
            <div className="term-cell">
              <div className="l">Instrument</div>
              <div className="v">Revenue-share, no equity dilution</div>
            </div>
            <div className="term-cell">
              <div className="l">Minimum Investment</div>
              <div className="v">NGN 5M</div>
            </div>
            <div className="term-cell">
              <div className="l">Investment Term</div>
              <div className="v">5 years</div>
            </div>
            <div className="term-cell">
              <div className="l">Target Return</div>
              <div className="v">Up to 3x capital</div>
            </div>
            <div className="term-cell">
              <div className="l">Repayment</div>
              <div className="v">35% of net profit, from Month 4</div>
            </div>
          </div>
          <p className="terms-note reveal">
            Repayment begins once operations stabilize (~Month 4) and continues until 3x capital is returned or the 5-year term concludes — whichever comes first.
          </p>
        </div>
      </section>

      <section className="light">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Long-Term Vision</span>
            <h2>Africa's leading active aging and postpartum wellness brand.</h2>
          </div>
          <p className="vision-statement reveal">Beginning with our flagship location in Ikoyi, and expanding into major African cities.</p>
          <div className="timeline reveal">
            <div className="tl-cell">
              <div className="num">YEAR 1</div>
              <h3>Establish</h3>
              <p>Launch, stabilize operations, build to 100 members.</p>
            </div>
            <div className="tl-cell">
              <div className="num">YEAR 2</div>
              <h3>Scale</h3>
              <p>Scale to 150 members at full capacity.</p>
            </div>
            <div className="tl-cell">
              <div className="num">YEAR 3+</div>
              <h3>Expand</h3>
              <p>Expand into additional African cities.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-footer">
        <div className="wrap">
          <h2>Let's build the category, together.</h2>
          <p className="sub">We're closing the remaining NGN 300M of our round to launch Physifit's flagship Ikoyi facility.</p>
          <div className="footer-cta-row">
            <a href="mailto:peter@hooom.org?subject=Physifit%20Investment%20Inquiry" className="btn btn-primary">
              Email peter@hooom.org
            </a>
            <a href="#invest" className="btn btn-ghost">
              Review the terms
            </a>
          </div>
          <div className="footer-bottom">
            <Link href="/">
              <Image
                src="/images/logo_dark.png"
                alt="PhysiFit Logo"
                width={120}
                height={32}
                className="object-contain h-7 w-auto"
              />
            </Link>
            <div className="footer-meta">
              This page is a summary of investment terms and is not an offer or solicitation in any jurisdiction where it would be unlawful. Figures are estimates based on internal modeling.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
