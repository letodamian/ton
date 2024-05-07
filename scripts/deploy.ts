import { Cell, StateInit, beginCell, contractAddress, storeStateInit, toNano } from "ton-core";
import { hex } from '../build/main.compiled.json';
import QueryString from "qs";
import { config } from "../config";

async function deployScript() {
  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const stateInit: StateInit = {
    code: codeCell,
    data: dataCell,
  };

  const stateInitBuilder = beginCell();
  storeStateInit(stateInit)(stateInitBuilder);
  const stateInitCell = stateInitBuilder.endCell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  const deployLink =
  'https://app.tonkeeper.com/transfer/' +
  address.toString({
      testOnly: config.isTestOnly,
  }) +
  "?" +
  QueryString.stringify({
      text: "Deploy contract by QR",
      amount: toNano("0.0001").toString(10),
      init: stateInitCell.toBoc({idx: false}).toString("base64"),
  });

  console.log(deployLink);

  const  scanAddr = 
    config.tonscanUrl +
    address.toString({
        testOnly: config.isTestOnly,
    })

  console.log(scanAddr);
}

deployScript();