import ScaleLoader from "react-spinners/ScaleLoader";
import styles from "../app/header.module.css";

export default function Loading() {
  return (<>

    <div>
      <h1 className={styles.logo}>
        <div>
          <span>SmartCompass</span>
        </div>
      </h1>
    </div>
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed' }}>
      <main style={{
        background: 'rgba(255, 255, 255, 0.3)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#fefefe',
        width: '70vw',
        height: '70vh',
        borderRadius: '10px',
        boxShadow: '7px 7px 20px 10px rgba(0, 0, 0, 0.5)',
        outline: '3px solid rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ScaleLoader color="#fefefe" />
      </main>
    </div>
  </>);
}
