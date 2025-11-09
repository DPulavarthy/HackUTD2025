import styles from './jobs.module.css'
import { useEffect, useState } from "react";
import Jobs from './Jobs'
import { Counter } from './Counter'

export default function Process({
    objectId,
    p, f
}: {
    objectId: string;
    p: [number, (percent: number) => void];
    f: [string[], (freelancers: string[]) => void];
}) {

    let [objectID, setObjectID] = useState<string>(objectId);

    useEffect(() => {
        if (p[0] === 100) {
            setShow(true)
        }
        document.documentElement.style.setProperty('--load', `${p[0] < 10 ? `0${p[0]}` : p[0]}%`)
        if (document.querySelector('#woot div')) document.querySelector('#woot div')!.setAttribute('data-percent', `${p[0] < 10 ? `0${p[0]}` : p[0]}%`)
    }, [p[0]])

    let [show, setShow] = useState(false)

    return (
        <>
            {!show ? <>

                <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', zIndex: 200 }} className={styles.jobs}>
                    <main style={{
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#fefefe',
                        width: '80vw',
                        backdropFilter: 'blur(15px)',
                        height: '80vh',
                        borderRadius: '10px',
                        flexDirection: 'column',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>

                        <div className={styles.load} id='woot'>
                            <div data-percent="0.0%"></div>
                        </div>
                    </main>
                </div>
            </> : <>
                <Jobs objectId={objectId} f={f} />
            </>}
        </>
    )
}