export const metadata = {
  title: 'Markdown Mirror Test App',
  description: 'Testing next-markdown-mirror package',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Markdown Mirror Test',
              url: 'http://localhost:3099',
            }),
          }}
        />
      </head>
      <body>
        <nav>
          <a href="/">Home</a> | <a href="/about">About</a>
        </nav>
        <main>{children}</main>
        <footer>
          <p>Test footer — should be filtered out</p>
        </footer>
      </body>
    </html>
  );
}
