import test from "node:test";
import assert from "node:assert/strict";
import {nextVersion,display} from "../scripts/bump.mjs";
test("same-day build increments",()=>assert.equal(nextVersion("26.11.16003",new Date("2026-11-16T10:00:00+01:00")),"26.11.16004"));
test("new date resets build",()=>assert.equal(nextVersion("26.11.16004",new Date("2026-11-17T10:00:00+01:00")),"26.11.17001"));
test("readable date format",()=>assert.equal(display("26.11.16003"),"26.11.16.003"));
