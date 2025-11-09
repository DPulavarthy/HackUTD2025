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

    let ws = new WebSocket('ws://localhost:8080/');
    ws.addEventListener('open', () => {
        console.log("Connected to WebSocket")
    });

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
  // Reliability & Durability
  "reliable","reliability","dependable","trustworthy","proven","solid","sturdy","tough",
  "robust","durable","durability","long lasting","longevity","quality","lasting","well built",
  "low maintenance","cheap maintenance","maintenance","upkeep","issues","problems","warranty",
  "guarantee","certified","cpo","coverage","support","service","servicing","dealer","dealership",
  "roadside","powertrain","bumper to bumper",

  // Safety
  "safe","safety","safer","safest","secure","security","protected","protection",
  "crash","airbag","airbags","collision","abs","braking","brake","brakes",
  "stability","traction","lane assist","blind spot","monitoring","backup camera",
  "parking sensors","adaptive cruise","emergency braking","saftey","safty","realiablity",

  // Comfort & Interior
  "comfortable","comfort","smooth ride","quiet","quiet cabin","refined","plush","soft","relaxing",
  "ergonomic","cozy","spacious","spacious interior","seating","interior","heated seats",
  "ventilated seats","premium feel","luxury feel","luxury","luxurious","premium","upscale",
  "climate control","ac","air conditioning","cushioned","comfy",

  // Performance & Driving
  "performance","high performance","engine performance","responsive","handling","stable handling",
  "agile","sporty","powerful","horsepower","torque","quick","fast","acceleration","nimble",
  "turbo","turbocharged","supercharged","hp","driving experience","easy to drive","smooth performance",

  // Fuel Economy & Efficiency
  "fuel efficient","efficiency","efficient","mpg","good mileage","low mileage","high mileage",
  "economical","economy","low fuel consumption","hybrid","electric","range","low running cost",
  "eco friendly","green vehicle","charge time","battery","ev","gas","gallon","thrifty",

  // Cost / Pricing
  "affordable","budget friendly","cost effective","low cost","value","value for money","budget",
  "cheap","cheaper","cheapest","inexpensive","price","pricey","costly","msrp","payments","financing",
  "finance","lease","leasing","monthly payment","deal","bargain","ownership cost","total cost",

  // Space & Use
  "cargo","storage","trunk","capacity","hauling","haul","carry","luggage","family","kids","baby",
  "groceries","errands","suv","crossover","van","minivan","utility","versatile","versatility","practical",
  "practicality","usable","usability","functional","functionality",

  // Technology & Convenience
  "tech","technology","infotainment","screen","display","touchscreen","bluetooth","carplay","android auto",
  "navigation","nav","gps","digital","wireless","connectivity","connected","smart","camera",
  "backup camera","sensors","sensor","assist","assistance","smartphone integration","modern","advanced",

  // Style & Exterior
  "style","styling","stylish","sleek","sharp","attractive","beautiful","elegant","contemporary","trendy",
  "design","exterior","color","paint","trim","grille","wheels","body","appearance","eye catching",
  "head turner","chic","cool","classy","sophisticated","upscale look",

  // Capability / Weather / Terrain
  "awd","4wd","fwd","rwd","all wheel drive","four wheel drive","ground clearance","offroad","terrain",
  "winter capable","snow","ice","wet","rain","climate","towing","tow","trailer","hitch","pulling",
  "boat","camper","rv"
].map((word) => word.toLowerCase())

    let once = false
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = async function () {
        console.log('Listening...');
        setStart(true)
    };

    async function runE2() {
        setJob(true);
        const list: string[] = []
        document.getElementById('transcript')?.innerHTML.match(/\<b\>.*?\<\/b\>/g)?.forEach((word: string) => {
            list.includes(word.trim().slice(3, -4)) ? null : list.push(word.trim().slice(3, -4).replace(/\.|,|!|\?/g, ''))
        })
        
        console.log(ws)
        ws.send(document.getElementById('transcript')?.innerText as string);

        // setPercent(100);
        function varyTimings(count: any, totalDurationMs: any) {
            // create random weights
            const weights = Array.from({ length: count }, () => Math.random());
            const weightSum = weights.reduce((a, b) => a + b, 0);

            // convert weights to exact durations that sum to totalDurationMs
            return weights.map(w => (w / weightSum) * totalDurationMs);
        }

        async function runCounter() {
            const totalDuration = 45_000; // 60 seconds
            const steps = 100;

            const delays = varyTimings(steps, totalDuration);

            for (let i = 1; i <= steps; i++) {
                setPercent(i);
                await new Promise(res => setTimeout(res, delays[i - 1]));

                if (i === 100) {
                    window.open('/car-recommendations.html', "_blank")
                    setJob(false)
                }
            }
        }

        runCounter();
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
        
        if (e.key === ' ') {
            setStart(!start);
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
                                // create()
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
