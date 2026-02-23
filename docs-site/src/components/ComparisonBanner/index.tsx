import React from 'react';
import styles from './styles.module.css';

const rows = [
  { feature: 'Price', cf: '$20/domain/month', mm: 'Free, MIT licensed', mmWins: true },
  { feature: 'Self-hosted', cf: false, mm: true, mmWins: true },
  { feature: 'Framework integration', cf: 'None (edge proxy)', mm: 'Native Next.js integration', mmWins: true },
  { feature: 'JSON-LD extraction', cf: false, mm: true, mmWins: true },
  { feature: 'llms.txt', cf: false, mm: true, mmWins: true },
  { feature: 'Custom filtering', cf: 'Limited', mm: 'Full control', mmWins: true },
  { feature: 'Token counting', cf: false, mm: true, mmWins: true },
  { feature: 'Open source', cf: false, mm: true, mmWins: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className={styles.check}>Yes</span>
    ) : (
      <span className={styles.cross}>No</span>
    );
  }
  return <span>{value}</span>;
}

export default function ComparisonBanner(): React.ReactElement {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading}>
          Stop paying Cloudflare $240/year per domain
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Cloudflare</th>
                <th className={styles.highlight}>next-markdown-mirror</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className={styles.featureCell}>{row.feature}</td>
                  <td>
                    <CellValue value={row.cf} />
                  </td>
                  <td className={styles.highlight}>
                    <CellValue value={row.mm} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
