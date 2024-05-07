import { compileFunc } from "@ton-community/func-js";
import { Cell } from "ton-core";
import { readFileSync, writeFileSync } from "fs"

async function compileScript() {
  const compileResult = await compileFunc({
    targets: ["./contracts/main.fc"],
    sources: (x) => readFileSync(x).toString("utf-8")
  })

  if (compileResult.status === "error") {
    console.log(compileResult.message, "error message");
    process.exit(1);
  }

  const hexArtifact = "build/main.compiled.json";

  writeFileSync(
    hexArtifact,
    JSON.stringify({
      hex:  Cell.fromBoc(Buffer.from(compileResult.codeBoc, "base64"))[0]
        .toBoc()
        .toString("hex")
    })
  )
}

compileScript();
