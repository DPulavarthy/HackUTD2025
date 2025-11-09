import { useCustomWallet } from "@/contexts/CustomWallet";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export const useCreateAgreementTransaction = () => {
  const { executeTransactionBlockWithoutSponsorship, address } = useCustomWallet();

  const handleExecute = async () => {
    const recipient = address!;

    console.log("recipient", recipient);

    const txb = new Transaction();

    // how do i get rercuiter address and amount from the frontend?

    const [coin] = txb.splitCoins(txb.gas, [10000]);

    txb.moveCall({
      target: `${clientConfig.PACKAGE_ID}::agreement::create`,
      arguments: [txb.pure.address("0x1e448751887e85132bb05e87ed9775c9961a9cc3107192a5898dfbedcb4319c3"),txb.pure.address("0x0"),coin]
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
