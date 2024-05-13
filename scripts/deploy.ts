import { NetworkProvider, compile } from "@ton-community/blueprint";
import { MainContract } from "../wrappers/MainContract";
import { address, toNano } from "ton-core";

export async function run(provider: NetworkProvider) {
  const codeCell = await compile("MainContract");

  const myContract = MainContract.createFromConfig
  (
    {
      number: 0,
      address: address("UQD0QxaCiGjPU99zc9ZbWJGvq_aAoTHJ748K38wVNyJwWvjf"),
      owner_address: address('UQD0QxaCiGjPU99zc9ZbWJGvq_aAoTHJ748K38wVNyJwWvjf')
    },
    codeCell,
  );

  const openedContract = await provider.open(myContract);
  openedContract.sendDeploy(
    provider.sender(),
    toNano("0.01")
  );

  await provider.waitForDeploy(myContract.address);
}
