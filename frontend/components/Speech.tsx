import { useEffect, useState } from 'react';
import Process from './Process';
import Jobs from './Jobs'
import { CreateAgreement } from "@/components/CreateAgreement";
import styles from './speech.module.css';

import ClipLoader from "react-spinners/ClipLoader";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCreateAgreementTransaction } from "@/hooks/useCreateAgreementTransaction";
import { useCustomWallet } from "@/contexts/CustomWallet";
// import { exec } from 'child_process';

export default function Speech() {

    const [objectId, setObjectId] = useState<string | null>(null);

    const [waitingForTxn, setWaitingForTxn] = useState(false);
    const { isConnected } = useCustomWallet();
    const [percent, setPercent] = useState(0);
    const [freelancers, setFreelancers] = useState<string[]>([]);

    const { handleExecute } = useCreateAgreementTransaction();

    let once1 = false

    async function create() {
        setWaitingForTxn(true);
        console.log("create agreement");
        const txn = await handleExecute();

        console.log("txn", txn);

        setObjectId((txn as any).effects?.created?.[0]?.reference?.objectId);

        if (objectId) {

            window.location.hash = objectId;
            setCounter(objectId);
        }

        setWaitingForTxn(false);
        setPercent(100);
    }



    const [start, setStart] = useState(false);
    const [counterId, setCounter] = useState<string | null>(null);
    const [job, setJob] = useState(false);
    let final = ''
    const { webkitSpeechRecognition }: any = window;
    const recognition = new webkitSpeechRecognition();
    let keywords = [
  "reliable",
  "reliability",
  "high reliability",
  "durable",
  "dependable",
  "long lasting",
  "performance",
  "high performance",
  "smooth performance",
  "engine performance",
  "fuel efficient",
  "low mileage",
  "good mileage",
  "high mileage",
  "low fuel consumption",
  "economical",
  "low cost",
  "affordable",
  "budget friendly",
  "cost effective",
  "cheap maintenance",
  "value for money",
  "comfortable",
  "high comfort",
  "smooth ride",
  "quiet cabin",
  "spacious interior",
  "premium feel",
  "luxury feel",
  "stable handling",
  "easy to drive",
  "great driving experience","highly durable", "high performance", "efficient",
].map((word) => word.toLowerCase())

    let once = false
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        console.log('Listening...');
        setStart(true)
    };

    async function runE2() {
        setJob(true);
        const list: string[] = []
        document.getElementById('transcript')?.innerHTML.match(/\<b\>.*?\<\/b\>/g)?.forEach((word: string) => {
            list.includes(word.trim().slice(3, -4)) ? null : list.push(word.trim().slice(3, -4).replace(/\.|,|!|\?/g, ''))
        })

        let result = await fetch(`http://localhost:8000/exec/${list.join(',')}`)
        let data = await result.json()
        setFreelancers(data)
        setPercent(33);

        await fetch(`http://localhost:8000/audio`)
        setPercent(66);
    }

    recognition.onresult = function (event: any) {


        let interim_transcript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;

                // Clean punctuation spacing
                let text = final.replace(/\.(?=[A-Za-z])/g, '. ');

                // Sort phrases by length DESC (so "two birds" matches before "birds")
                const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

                // For each keyword/phrase, wrap it in <b> tags (case-insensitive)
                sortedKeywords.forEach((phrase) => {
                const regex = new RegExp(`\\b${phrase}\\b`, "gi");
                text = text.replace(regex, (m) => `<b>${m}</b>`);
                });

                final = text;

                // final = final.replace(/\.(?=[A-z]{1})/g, '. ').split(' ').map((word: string) => keywords.includes((word.toLowerCase().match(/[A-z]*/g) as any)?.[0]) ? `<b>${word}</b>` : word).join(' ');
            } else {
                interim_transcript += event.results[i][0].transcript;
                // interim_transcript = interim_transcript.replace(/\.(?=[A-z]{1})/g, '. ').split(' ').map((word: string) => keywords.includes((word.toLowerCase().match(/[A-z]*/g) as any)?.[0]) ? `<b>${word}</b>` : word).join(' ');

                // Clean punctuation spacing
                let text = interim_transcript.replace(/\.(?=[A-Za-z])/g, '. ');

                // Sort phrases by length DESC (so "two birds" matches before "birds")
                const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

                // For each keyword/phrase, wrap it in <b> tags (case-insensitive)
                sortedKeywords.forEach((phrase) => {
                const regex = new RegExp(`\\b${phrase}\\b`, "gi");
                text = text.replace(regex, (m) => `<b>${m}</b>`);
                });

                interim_transcript = text;

            }
        }

        if (document.getElementById('transcript')) document.getElementById('transcript')!.innerHTML = `${final} ${interim_transcript}`
    };

    recognition.onend = function () {
        console.log('Stopped listening');
    };

    window.onkeyup = (e) => {
        if (e.key === 'Escape' && job) {
            setJob(false)
        }
    }

    return (<>
        {job && <>
            {!once && <Process objectId={objectId as string} p={[percent, setPercent]} f={freelancers as any} />}
            {once = true}
        </>}
        {job && <div className={styles.escape + ' t'} onClick={() => setJob(false)}>x</div>}
        <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed' }}>
            <main style={{
                background: 'rgba(255, 255, 255, 0.3)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#fefefe',
                width: '70vw',
                height: '70vh',
                borderRadius: '10px',
                boxShadow: '7px 7px 20px 10px rgba(0, 0, 0, 0.5)',
                outline: '3px solid rgba(255, 255, 255, 1)',
                backdropFilter: 'blur(10px)',
                flexDirection: 'column',
                display: start ? 'block' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div className={styles.speech}>
                    <div className={styles.start + ' woopie'}
                        data-text={start ? 'Press me to stop recording' : 'Press me to start recording'}
                        style={{
                            width: 'max-content',
                            height: 'max-content',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '50%',
                            position: 'absolute',
                            padding: '10px',
                            background: start ? 'rgba(67, 181, 129, 1)' : 'rgba(255, 255, 255, 0.5)',
                            boxShadow: start ? 'none' : '3px 3px 20px 3px rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(10px)',
                            outline: start ? '6px solid rgba(255, 255, 255, 1)' : '4px solid rgba(255, 255, 255, 1)',
                            transform: start ? 'scale(0.5) translate(-50%, -50%)' : 'translate(-50%, -50%)',
                            top: start ? 'calc(100% - 30px)' : '50%',
                            left: 'calc(50% - 10px)',
                        }}
                        onClick={(e) => {
                            if (start) {
                                setStart(false)
                                runE2()
                                create()
                            }
                            recognition[!start ? 'start' : 'stop']();
                        }}>
                        <img src="./mic.png" alt="mic" style={{
                            filter: start ? 'invert(1)' : 'invert(0)',
                        }} />
                    </div>
                    {start && <p id="transcript"><i>Listening...</i></p>}
                    {/* <p style={{ display: start ? 'block' : 'none' }}></p> */}
                </div>
            </main>
        </div>
    </>);
}
