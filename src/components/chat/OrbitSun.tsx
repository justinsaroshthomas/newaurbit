import styles from './OrbitSun.module.css';

export default function OrbitSun() {
  return (
    <div className={styles.solarSystem}>
      <div className={styles.sun}>
         <div className={styles.sunCore}>Z</div>
      </div>
      <div className={styles.orbit1}>
        <div className={styles.planet1}>L</div>
      </div>
      <div className={styles.orbit2}>
        <div className={styles.planet2}>A</div>
      </div>
    </div>
  );
}
