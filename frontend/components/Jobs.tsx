import styles from './jobs.module.css'
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCreateAgreementTransaction } from "@/hooks/useCreateAgreementTransaction";
import { useCustomWallet } from "@/contexts/CustomWallet";
import { useClaimTransaction } from "@/hooks/useClaimTransaction";
import { Counter } from "./Counter";

export default function Jobs({
    objectId,
    f
}: {
    objectId: string;
    f: [string[], (freelancers: string[]) => void];
}) {

    const [show, setShow] = useState(false);
    const [objectID, setObjectID] = useState(objectId);


    const [waitingForTxn, setWaitingForTxn] = useState(false);
    const { isConnected } = useCustomWallet();

    const { handleExecute } = useClaimTransaction();

    async function claim() {
        setWaitingForTxn(true);
        console.log("create agreement", objectId);
        const txn = await handleExecute(objectId);
        objectId = (txn as any).effects?.created?.[0]?.reference?.objectId;

        console.log("txn", txn);


        if (objectId) {
            // onCreated(objectId);

            window.location.hash = objectId;
            //   setCounter(objectID);
        }

        setWaitingForTxn(false);
        setShow(true);
    }

    useEffect(() => {

        const audio = new Audio('http://localhost:8000/output.wav');

        if (!isAudioPlaying()) {
            audio.addEventListener('loadeddata', function () {
                audio.play();
            });
        }

        function isAudioPlaying() {
            const audios = document.querySelectorAll('audio');

            for (let i = 0; i < audios.length; i++) {
                if (!audios[i].paused) {
                    return true;
                }
            }

            return false;
        }

    }, [])
    return (
        <>
            {show && <Counter id={objectId} setObjectID={setObjectID} />}
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

                    {/* Loop though f and convert each to an element */}

                    {f.map((freelancer: any) => {
                        return (
                            <div className={styles.job} onClick={(e) => claim()}>
                                <div className={styles.header} style={{ pointerEvents: 'none' }}>
                                    <h1>{freelancer.first_name} {freelancer.last_name}</h1>
                                    <div className={styles.require}>
                                        {freelancer.skills.split(', ').map((skill: any, i: number) => {
                                            return <span key={i}>{skill}</span>
                                        }).slice(0, 5)}
                                    </div>
                                    <span></span>
                                    <p>{Math.floor(Math.random() * 11) + 90}% Compatible</p>
                                </div>
                                {/* <p style={{ pointerEvents: 'none' }}>Imagine a good job oppertunity</p> */}
                            </div>
                        );
                    })}
                </main>
            </div>
        </>
    )
}