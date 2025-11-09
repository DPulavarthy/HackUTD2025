"use client";

import styles from "./header.module.css"
import { useEffect, useState } from "react";
import { useCustomWallet } from "@/contexts/CustomWallet";
// import ProfilePopover from "@/components/ProfilePopover";
import { CreateAgreement } from "@/components/CreateAgreement";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { Counter } from "@/components/Counter";
import dynamic from 'next/dynamic';
import { ClaimButton } from "@/components/ClaimButton";
import { CompleteButton } from "@/components/CompleteButton";
import { IncompleteButton } from "@/components/IncompleteButton";

const ProfilePopover = dynamic(() => import('@/components/ProfilePopover'), { ssr: false });

export default function Page() {
  const { isConnected } = useCustomWallet();
  const [counterId, setCounter] = useState<string | null>(null);
  const [objectID, setObjectID] = useState<string>("null");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (isValidSuiObjectId(hash)) {
      setCounter(hash);
    }
  }, []);


  return (
    <div className="w-full h-full min-h-screen">
      <div>
        <h1 className={styles.logo}>
          <div>
            <span>SmartCompass</span>
          </div>
        </h1>
      </div>
      <ProfilePopover />
      <div className="w-full flex flex-col items-center gap-4 p-4">
        
          
        {
          counterId ? <>
            <Counter id={counterId} setObjectID = {setObjectID}/>
            </>
           : 
            <>
            {/* <CreateAgreement
              onCreated={(id) => {
                window.location.hash = id;
                setCounter(id);
                
              }}
            />
             */}
            </>
           
            
          }
          
            {objectID!=="null" &&
          <>
          <ClaimButton onCreated={(id) => {
                window.location.hash = id;
                setCounter(id);
                
              }} objectID={objectID}/>
              <CompleteButton onCreated={(id) => {
                window.location.hash = id;
                setCounter(id);
                
              } } objectID={objectID}/>
              <IncompleteButton onCreated={(id) => {
                window.location.hash = id;
                setCounter(id);
                
              } } objectID={objectID}/>
          </>}
          
      </div>
    </div >
  );
}
