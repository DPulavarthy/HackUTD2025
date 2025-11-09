import { useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import type { SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useClaimTransaction } from "@/hooks/useClaimTransaction";
import { useCustomWallet } from "@/contexts/CustomWallet";
import { set } from "zod";
import { CompleteButton } from "@/components/CompleteButton";
import { IncompleteButton } from "@/components/IncompleteButton";
import styles from './jobs.module.css'

let freelancer = "wfbnebnrgfoi"

export function Counter({ id, setObjectID, }: { id: string, setObjectID: any }) {

  const [counter, setCounter] = useState<string | null>(null);
  setObjectID(id)
  const { address, isConnected } = useCustomWallet();
  const suiClient = useSuiClient();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  // refetch the data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const [waitingForTxn, setWaitingForTxn] = useState("");



  if (isPending) return <></>;

  if (error) return <span>Error: {error.message}</span>;

  if (!data.data) return <></>

  const obj = data.data?.content?.fields;
  const balance = obj.balance;
  const rercuiter = obj.recruiter;
  freelancer = obj.freelancer;
  const status = obj.status ? "Complete" : "Incomplete";
  console.log(balance, freelancer, rercuiter, status);
  console.log(data.data?.content?.fields);

  return (
    <Card style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: 1000,
      transform: "translate(-50%, -50%)",
      padding: "20px",
      width: "60vw",
      height: "65vh",
      boxShadow: "0 0 10px rgba(0, 0, 0, 1)",
      backdropFilter: "blur(10px)",
      background: "rgba(255, 255, 255, 0.5)",
      outline: "3px solid rgba(255, 255, 255, 1)",
    }} className={styles.card}>
      <CardHeader>
        <CardTitle className="text-xl woopie" style={{ fontSize: '37px', textAlign: "center" }}>AGREEMENT</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 t">
        <span style={{ textTransform: "capitalize" }}>Amount: {balance}</span>
        <span style={{ textTransform: "capitalize" }}>Freelancer: {freelancer}</span>
        <span style={{ textTransform: "capitalize" }}>Rercuiter: {rercuiter}</span>
        <span style={{ textTransform: "capitalize" }}>Status: {status}</span>


        <div style={{
          display: "flex",
          justifyContent: "center",
        }}>
          <CompleteButton onCreated={(id) => {
            window.location.hash = id;
            setCounter(id);

          }} objectID={id} />
          <IncompleteButton onCreated={(id) => {
            window.location.hash = id;
            setCounter(id);
          }} objectID={id} />
        </div>

      </CardContent>
    </Card>
  );
}

