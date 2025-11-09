import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCreateAgreementTransaction } from "@/hooks/useCreateAgreementTransaction";
import { useCustomWallet } from "@/contexts/CustomWallet";
import { useClaimTransaction } from "@/hooks/useClaimTransaction";

export function ClaimButton({
  onCreated,
  objectID,
}: {
  onCreated: (id: string) => void, objectID: string;
}) {
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const { isConnected } = useCustomWallet();

  const { handleExecute } = useClaimTransaction();

  async function claim() {
    setWaitingForTxn(true);
    console.log("create agreement");
    const txn = await handleExecute(objectID);
    
    console.log("txn", txn);

    setWaitingForTxn(false);
  }

  return (
    <Card>
      <Button
        onClick={() => {
          console.log("claim job");
          claim();
        }}
        disabled={waitingForTxn || !isConnected}
      >
        {waitingForTxn ? <ClipLoader size={20} /> : isConnected ? "Claim" : "connect wallet"}
      </Button>
    </Card>
  );
}
