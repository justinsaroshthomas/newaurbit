'use client';

import Link from 'next/link';
import Orbit3D from '@/components/chat/Orbit3D';
import styles from './(main)/page.module.css';

export default function NotFound() {
  return (
    <div className={styles.homeContainer} style={{ height: '100vh', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.3 }}>
        <Orbit3D lowPower={false} />
      </div>
      
      <div style={{ position: 'relative', zIndex: 10 }}>

        <h1 style={{ fontSize: '80px', fontWeight: '900', margin: '0' }}>404</h1>
        <h2 style={{ fontSize: '24px', opacity: 0.8, marginBottom: '32px' }}>Lost in the Cosmic Orbit</h2>
        <p style={{ maxWidth: '400px', margin: '0 auto 40px', opacity: 0.6 }}>
          The space you're looking for has drifted into a black hole or doesn't exist in this universe.
        </p>
        
        <Link href="/">
          <button className="btn-aurbit">Return to Navigation</button>
        </Link>
      </div>
    </div>
  );
}
