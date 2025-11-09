import { useCustomWallet } from "@/contexts/CustomWallet";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export const useSettleTransaction = () => {
  const { executeTransactionBlockWithoutSponsorship, address } = useCustomWallet();

  const handleExecute = async (success:boolean, id:string) => {
    const recipient = address!;

    console.log("recipient", recipient);

    const txb = new Transaction();

    // how do i get rercuiter address and amount from the frontend?


    txb.moveCall({
      target: `${clientConfig.PACKAGE_ID}::agreement::settle`,
      arguments: [txb.object(id), txb.pure.bool(success)]
    });

    return await executeTransactionBlockWithoutSponsorship({
      tx: txb,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    })
      .then((resp) => {
        console.log(resp);
        return resp;
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  };

  return { handleExecute };
};
