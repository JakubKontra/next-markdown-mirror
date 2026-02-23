import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import ComparisonBanner from '@site/src/components/ComparisonBanner';
import styles from './index.module.css';

const problemFeatures = [
  {
    title: 'AI agents see garbage',
    description:
      'JS-rendered sites return framework noise to crawlers. Your carefully crafted content is invisible.',
    icon: '🗑',
  },
  {
    title: 'Cloudflare charges $20/mo',
    description:
      'Their Markdown conversion is locked behind the Pro plan. That\'s $240/year per domain. This package is free and open source.',
    icon: '💸',
  },
  {
    title: "You're losing AI traffic",
    description:
      "When competitors are readable and you aren't, they get cited instead. This is the new SEO.",
    icon: '📉',
  },
];

const featuresList = [
  {
    title: '3-File Setup',
    description:
      'Add a proxy, route handler, and llms.txt endpoint. That\'s it. Works with Next.js 16+.',
    icon: '📁',
  },
  {
    title: 'JSON-LD Frontmatter',
    description:
      'Structured data from your pages is preserved as YAML frontmatter in the Markdown output.',
    icon: '🏷',
  },
  {
    title: 'llms.txt Protocol',
    description:
      'AI discovery protocol built in. Tell AI agents what pages exist and how to read them.',
    icon: '🤖',
  },
  {
    title: 'Intelligent Filtering',
    description:
      'Automatically strips nav, footer, ads, scripts, and other non-content elements.',
    icon: '🧹',
  },
  {
    title: 'GFM + Extended Markdown',
    description:
      'Tables, task lists, definition lists, figures, abbreviations, and more.',
    icon: '📝',
  },
  {
    title: 'Token Counting',
    description:
      'Every response includes an x-markdown-tokens header with the estimated token count.',
    icon: '🔢',
  },
];

const beforeCode = `<div id="__next">
  <div class="layout_main__abc">
    <nav class="nav_root__xyz">
      <div class="nav_inner__def">
        <a class="nav_logo__ghi">...</a>
        <ul class="nav_links__jkl">
          <li class="nav_item__mno">...</li>
        </ul>
      </div>
    </nav>
    <main class="page_wrapper__pqr">
      <div class="content_root__stu">
        <script>self.__next_f.push(...)</script>
        <template>...</template>`;

const afterCode = `---
title: "About Us"
description: "We build tools for developers"
type: "AboutPage"
---

# About Us

We build tools that make the web
more accessible to AI agents.

## Our Mission

Ensure every website can communicate
with large language models.`;

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npm install next-markdown-mirror');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className={styles.installCommand} onClick={handleCopy}>
      <span>npm install next-markdown-mirror</span>
      <span className={styles.copyIcon}>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

function HeroSection() {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className={styles.heroTitle}>Your website is invisible to AI.</h1>
        <p className={styles.heroSubtitle}>
          ChatGPT, Claude, and Perplexity can't read your JavaScript-rendered
          pages. They see mangled HTML — or nothing at all. Fix it in 3 minutes.
        </p>
        <InstallCommand />
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Get Started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/how-it-works"
          >
            See How It Works
          </Link>
        </div>
        <div className={styles.badges}>
          <img
            alt="npm version"
            src="https://img.shields.io/npm/v/next-markdown-mirror"
          />
          <img
            alt="License: MIT"
            src="https://img.shields.io/npm/l/next-markdown-mirror"
          />
          <img
            alt="GitHub stars"
            src="https://img.shields.io/github/stars/jakubkontra/next-markdown-mirror"
          />
        </div>
      </div>
    </header>
  );
}

function BeforeAfterSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>See the difference</h2>
        <div className={styles.beforeAfter}>
          <div className={styles.beforeColumn}>
            <div className={styles.columnLabel}>
              <span className={styles.labelBad}>What AI sees now</span>
            </div>
            <pre className={styles.codeBlock}>
              <code>{beforeCode}</code>
            </pre>
          </div>
          <div className={styles.afterColumn}>
            <div className={styles.columnLabel}>
              <span className={styles.labelGood}>With next-markdown-mirror</span>
            </div>
            <pre className={styles.codeBlock}>
              <code>{afterCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <h2 className={styles.ctaTitle}>Make your site visible to AI. Today.</h2>
        <InstallCommand />
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Your website is invisible to AI"
      description="Self-hosted Markdown for AI agents. The free alternative to Cloudflare's $20/domain/month Markdown conversion."
    >
      <HeroSection />
      <main>
        <section className={styles.sectionAlt}>
          <div className="container">
            <h2 className={styles.sectionTitle}>The Problem</h2>
            <HomepageFeatures features={problemFeatures} />
          </div>
        </section>
        <BeforeAfterSection />
        <section className={styles.sectionAlt}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Features</h2>
            <HomepageFeatures features={featuresList} />
          </div>
        </section>
        <ComparisonBanner />
        <CtaSection />
      </main>
    </Layout>
  );
}
