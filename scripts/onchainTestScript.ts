import { Address, Cell, contractAddress, toNano } from "ton-core";
import { hex } from '../build/main.compiled.json';
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { TonClient4 } from 'ton';
import QueryString from "qs";
import { config } from "../config";

async function onchainTestScript() {
  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  const endpoint = await getHttpV4Endpoint({
    network: config.network,
  });
  const client4 = new TonClient4({ endpoint });

  const latestBlock = await client4.getLastBlock();
  const status = await client4.getAccount(latestBlock.last.seqno, address);

  if(status.account.state.type !== "active") {
    console.log("contract is not active");
    return;
  }

  const deployLink =
  'https://app.tonkeeper.com/transfer/' +
  address.toString({
      testOnly: config.isTestOnly,
  }) +
  "?" +
  QueryString.stringify({
      text: "Deploy contract by QR",
      amount: toNano("0.0001").toString(10),
  });

  console.log(deployLink);

  let recent_sender_archive: Address;

  setInterval(async () => {
    const latestBlock = await client4.getLastBlock();
    const { exitCode, result } = await client4.runMethod(
      latestBlock.last.seqno,
      address,
      "get_the_last_sender",
    );

    if(exitCode !== 0) {
      console.log("runnng getter method failes");
      return;
    }

    if(result[0].type !== 'slice') {
      console.log("resuult type is otheer theen slice");
      return;
    }

    let most_resent_sender = result[0].cell.beginParse().loadAddress();

    if(most_resent_sender &&
      most_resent_sender.toString() !== recent_sender_archive?.toString()
    ) {
      console.log("new receent sender found " + most_resent_sender.toString({ testOnly: true }));
      recent_sender_archive = most_resent_sender;
    }
  }, 2000)
}

onchainTestScript()