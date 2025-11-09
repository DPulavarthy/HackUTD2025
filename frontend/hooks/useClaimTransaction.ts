import { useCustomWallet } from "@/contexts/CustomWallet";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export const useClaimTransaction = () => {
  const { executeTransactionBlockWithoutSponsorship, address } = useCustomWallet();

  const handleExecute = async (
    id: string
  ) => {
    const recipient = address!;

    const txb = new Transaction();

    txb.moveCall({
      arguments: [txb.object(id), txb.pure.address(recipient)],
      target: `${clientConfig.PACKAGE_ID}::agreement::claim`,
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
