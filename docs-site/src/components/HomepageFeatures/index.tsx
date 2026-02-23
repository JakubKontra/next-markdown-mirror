import React from 'react';
import styles from './styles.module.css';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Props {
  features: Feature[];
}

export default function HomepageFeatures({ features }: Props): React.ReactElement {
  return (
    <div className={styles.grid}>
      {features.map((feature, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.icon}>{feature.icon}</div>
          <h3 className={styles.cardTitle}>{feature.title}</h3>
          <p className={styles.cardDescription}>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
