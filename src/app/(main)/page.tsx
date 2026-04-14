'use client';

import { useState } from 'react';
import Feed from '@/components/feed/Feed';
import Orbit3D from '@/components/chat/Orbit3D';
import { useAppConfig } from '@/context/AppConfigContext';
import styles from './page.module.css';

const MOODS = ['All Spaces', 'Global Orbit', 'Chill', 'Hype', 'Deep'];


export default function HomePage() {
  const [activeMood, setActiveMood] = useState('All Spaces');
  const { lowPowerMode } = useAppConfig();

  return (
    <div className={styles.homeContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.orbitBackground}>
          <Orbit3D lowPower={lowPowerMode} />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Social Orbit</h1>
          <p className={styles.subtitle}>Explore the universe of your connections.</p>
          <div className={styles.moodFilters}>
            {MOODS.map(mood => (
              <span
                key={mood}
                className={`${styles.moodTag} ${activeMood === mood ? styles.active : ''}`}
                onClick={() => setActiveMood(mood)}
                style={{ cursor: 'pointer' }}
              >
                {mood}
              </span>
            ))}
          </div>
        </div>
      </header>

      <Feed mood={activeMood} />
    </div>
  );
}
