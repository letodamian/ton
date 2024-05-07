import { Cell, toNano } from "ton-core";
import { Blockchain } from "@ton-community/sandbox";
import { hex } from '../build/main.compiled.json';
import { MainContract } from "../wrappers/MainContract";

import "@ton-community/test-utils";

describe("main.fc contract teest", () => {

  it("our first teest", async () => {
    const blockchain = await Blockchain.create();
    const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

    const myContract = blockchain.openContract(
      await MainContract.createFromConfig({}, codeCell)
    )

    const senderWallet = await blockchain.treasury('sender');

    const sentMessageResult = await myContract.sendInternalMessage(
      senderWallet.getSender(), 
      toNano("0.05") // 1_000_000_000
    ); 
  
    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    })

    const data = await myContract.getData();

    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
  });
});
