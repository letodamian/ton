import { Cell, toNano } from "ton-core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton-community/sandbox";
import { MainContract } from "../wrappers/MainContract";
import { compile } from "@ton-community/blueprint";

import "@ton-community/test-utils";

describe("main.fc contract test", () => {

  let blockchain: Blockchain;
  let myContract: SandboxContract<MainContract>;
  let initWallet: SandboxContract<TreasuryContract>;
  let ownerWallet: SandboxContract<TreasuryContract>;
  let codeCell: Cell;

  beforeAll(async () => {
    codeCell = await compile("MainContract");
  });

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWallet = await blockchain.treasury('initWallet');
    ownerWallet = await blockchain.treasury('ownerWallet');

    myContract = blockchain.openContract(
      await MainContract.createFromConfig(
        {
          number: 0,
          address: initWallet.address,
          owner_address: ownerWallet.address,
        }, 
        codeCell
      )
    )

  })

  it("Should init succesfully and get proper most recent sender address", async () => {
    const senderWallet = await blockchain.treasury('sender');

    const sentMessageResult = await myContract.sendIncrement(
      senderWallet.getSender(), 
      toNano("0.05"), // 1_000_000_000
      5
    ); 
  
    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    })

    const data = await myContract.getData();

    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
    expect(data.number).toEqual(6);
  });

  it('Successfully deposit funds', async () => {
    const senderWallet = await blockchain.treasury('senderWallet');

    const depositMessageeResulst = await myContract.sendDeposit(
      senderWallet.getSender(),
      toNano('5'),
    );

    expect(depositMessageeResulst.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const balanceRequest = await myContract.getBalance();

    expect(balanceRequest.balance).toBeGreaterThan(toNano('4.99')) 
  })

  it('failed with no-code deposit funds', async () => {
    const senderWallet = await blockchain.treasury('senderWallet');

    const depositMessageeResulst = await myContract.sendNoCodeDeposit(
      senderWallet.getSender(),
      toNano('5'),
    );

    expect(depositMessageeResulst.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: false,
    });

    const balanceRequest = await myContract.getBalance();

    expect(balanceRequest.balance).toEqual(0); 
  })

  it('Succesfully withdthars funds on befalf of owner', async () => {
    const senderWallet = await blockchain.treasury('senderWallet');

    await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

    const withdrawalRequstResult = await myContract.sendWithdrawalRequst(
      ownerWallet.getSender(),
      toNano('0.1'),
      toNano(1),
    );

    expect(withdrawalRequstResult.transactions).toHaveTransaction({
      from: myContract.address,
      to: ownerWallet.address,
      success: true,
      value: toNano(1),
    });
  });

  it("fails to withdraw funds on behalf of not-owner", async () => {
    const senderWallet = await blockchain.treasury("sender");

    await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

    const withdrawalRequestResult = await myContract.sendWithdrawalRequst(
      senderWallet.getSender(),
      toNano("0.5"),
      toNano("1")
    );

    expect(withdrawalRequestResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 103,
    });
  });
  it("fails to withdraw funds because lack of balance", async () => {
    const withdrawalRequestResult = await myContract.sendWithdrawalRequst(
      ownerWallet.getSender(),
      toNano("0.5"),
      toNano("1")
    );

    expect(withdrawalRequestResult.transactions).toHaveTransaction({
      from: ownerWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 104,
    });
  });
});
