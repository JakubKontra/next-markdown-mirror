export default function Home() {
  return (
    <>
      <h1>Welcome to the Test Site</h1>
      <p>
        This is the <strong>home page</strong> of our next-markdown-mirror test
        application. It demonstrates HTML to Markdown conversion.
      </p>
      <h2>Features</h2>
      <ul>
        <li>Automatic HTML → Markdown conversion</li>
        <li>JSON-LD extraction as YAML frontmatter</li>
        <li>Smart content detection</li>
        <li>llms.txt generation</li>
      </ul>
      <h2>How It Works</h2>
      <p>
        When an AI agent sends a request with <code>Accept: text/markdown</code>,
        the proxy rewrites the request to an internal route handler that fetches
        the page as HTML, converts it to Markdown, and returns it.
      </p>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>How</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Accept header</td>
            <td>
              <code>Accept: text/markdown</code>
            </td>
          </tr>
          <tr>
            <td>Query parameter</td>
            <td>
              <code>?v=md</code>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
