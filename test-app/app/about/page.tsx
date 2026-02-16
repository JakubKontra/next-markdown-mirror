export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'About This Project',
            description:
              'markdown-mirror is a self-hosted Markdown for AI agents',
            datePublished: '2025-01-15',
            author: { '@type': 'Person', name: 'Test Author' },
          }),
        }}
      />
      <h1>About This Project</h1>
      <p>
        <strong>markdown-mirror</strong> is a self-hosted alternative to{' '}
        <a href="https://blog.cloudflare.com/markdown-for-agents/">
          Cloudflare Markdown for Agents
        </a>
        .
      </p>

      <h2>Key Features</h2>
      <dl>
        <dt>Framework Agnostic Core</dt>
        <dd>Works with any Node.js framework — Express, Fastify, etc.</dd>
        <dt>Next.js Integration</dt>
        <dd>First-class support for Next.js 16+ with proxy.ts</dd>
        <dt>JSON-LD Extraction</dt>
        <dd>Automatically extracts structured data as YAML frontmatter</dd>
      </dl>

      <h2>Expandable Section</h2>
      <details>
        <summary>Technical Details</summary>
        <p>
          The conversion pipeline: Parse HTML → Extract JSON-LD → Find main
          content → Filter non-content → Resolve URLs → Convert to Markdown →
          Clean up → Add frontmatter
        </p>
      </details>

      <figure>
        <img src="/architecture.png" alt="Architecture diagram" />
        <figcaption>Figure 1: Architecture overview</figcaption>
      </figure>

      <p>
        Water is H<sub>2</sub>O. Einstein discovered E=mc<sup>2</sup>.
      </p>

      <p>
        Some <mark>highlighted text</mark> for emphasis.
      </p>

      <div data-md-skip>
        <p>This internal-only content should NOT appear in markdown.</p>
      </div>
    </>
  );
}
