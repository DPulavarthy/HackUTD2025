import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCreateAgreementTransaction } from "@/hooks/useCreateAgreementTransaction";
import { useCustomWallet } from "@/contexts/CustomWallet";
import { useClaimTransaction } from "@/hooks/useClaimTransaction";
import { useSettleTransaction } from "@/hooks/useSettleTransaction";

export function CompleteButton({
  onCreated,
  objectID,
}: {
  onCreated: (id: string) => void, objectID: string;
}) {
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const { isConnected } = useCustomWallet();

  const { handleExecute } = useSettleTransaction();

  async function claim() {
    setWaitingForTxn(true);
    console.log("create agreement");
    const txn = await handleExecute(true,objectID);
    
    console.log("txn", txn);

    const objectId = txn.effects?.created?.[0]?.reference?.objectId;

    if (objectId) {
      onCreated(objectId);
    }

    setWaitingForTxn(false);
  }

  return (
    <Card style={{
      width: 'max-content',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'transparent',
      outline: 'none',
      border: 'none',
      marginRight: '20px'
    }}>
      <Button
      style={{ zIndex: 1000, position: "relative", width: '100px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      outline: '2px solid #000',
       }}
        onClick={() => {
          console.log("claim job");
          claim();
        }}
        disabled={waitingForTxn || !isConnected}
      >
        {waitingForTxn ? <ClipLoader size={20} /> : isConnected ? "✅" : "connect wallet"}
      </Button>
    </Card>
  );
}
