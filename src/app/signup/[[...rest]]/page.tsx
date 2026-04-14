'use client';

import { SignUp } from '@clerk/nextjs';
import styles from './login.module.css';
import Orbit3D from '@/components/chat/Orbit3D';

export default function SignUpPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.orbitBackground}>
        <Orbit3D lowPower={false} />
      </div>

      <div className={styles.bgGlow} />
      <div className={styles.bgGlow2} />
      
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <div className={styles.orbitRing}>
            <div className={styles.orbitRing2}>
              <div className={styles.logoCore}>A</div>
            </div>
          </div>
          <h1 className={styles.brandName}>Aurbit</h1>
          <p className={styles.tagline}>Join the Galaxy</p>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✨</span>
              <span>Exclusive Circle Access</span>
            </div>
          </div>
        </div>

        <div className={styles.authSection}>
          <SignUp 
            path="/signup"
            routing="path"
            appearance={{
              elements: {
                rootBox: styles.clerkRoot,
                card: styles.clerkCard,
                headerTitle: styles.clerkTitle,
                headerSubtitle: styles.clerkSubtitle,
                socialButtonsBlockButton: styles.clerkSocialButton,
                formButtonPrimary: styles.clerkButton,
                dividerRow: { display: 'none' },
                formFieldInput: { background: 'rgba(255,255,255,0.05)', color: '#fff' }
              }
            }}
            fallbackRedirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
