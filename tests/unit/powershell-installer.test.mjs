import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const powershellInstaller = path.join(root, "scripts", "install.ps1");

test("PowerShell installer parses and forwards install arguments", { skip: process.platform !== "win32" }, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-pwsh-"));
  const bin = path.join(temp, "bin");
  const target = path.join(temp, "target");
  const log = path.join(temp, "npx.log");
  fs.mkdirSync(bin);
  fs.mkdirSync(target);
  fs.writeFileSync(
    path.join(bin, "npx.cmd"),
    "@echo off\r\n" +
      "echo %*>>\"%DREAMY_NPX_LOG%\"\r\n" +
      "exit /b 0\r\n"
  );

  execFileSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", powershellInstaller, "-Target", target, "-Preset", "core"],
    { cwd: root, env: { ...process.env, DREAMY_NPX_LOG: log, PATH: `${bin}${path.delimiter}${process.env.PATH}` } }
  );

  const calls = fs.readFileSync(log, "utf8").trim().split(/\r?\n/);
  assert.equal(calls.length, 2);
  assert.match(calls[0], /^--yes github:Dreamy-Game-Foundation\/dreamy-codex-toolkit#main install /);
  assert.match(calls[0], / --preset core$/);
  assert.match(calls[1], /^--yes github:Dreamy-Game-Foundation\/dreamy-codex-toolkit#main doctor /);
});
