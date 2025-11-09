import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCreateAgreementTransaction } from "@/hooks/useCreateAgreementTransaction";
import { useCustomWallet } from "@/contexts/CustomWallet";

export function CreateAgreement({
  mic,
  onCreated,
}: {
  mic: boolean;
  onCreated: (id: string) => void;
}) {
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const { isConnected } = useCustomWallet();

  const { handleExecute } = useCreateAgreementTransaction();

  async function create() {
    setWaitingForTxn(true);
    console.log("create agreement");
    const txn = await handleExecute();

    console.log("txn", txn);

    const objectId = (txn as any).effects?.created?.[0]?.reference?.objectId;

    if (objectId) {
      onCreated(objectId);
    }

    setWaitingForTxn(false);
  }

  if (mic) {
    setTimeout(() => {
      document.getElementById("create-agreement")?.click();
    }, 1000)
  }

  return (
    <Card>
      <Button
        id="create-agreement" 
        style={{ zIndex: 1000, position: "relative" }}
        onClick={() => {
          console.log("create agreement");
          create();
        }}
        disabled={waitingForTxn || !isConnected}
      >
        {waitingForTxn ? <ClipLoader size={20} /> : isConnected ? "Create" : "connect wallet"}
      </Button>
    </Card>
  );
}
