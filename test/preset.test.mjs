import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { parse } from "yaml";

import { mergeProviders, toProviders, validatePreset } from "../lib/preset.js";

const root = join(import.meta.dirname, "..");
const patch = parse(readFileSync(join(root, "cordis.patch.yml"), "utf8"));
const preset = JSON.parse(readFileSync(join(root, "presets", "omnigate-models.json"), "utf8"));
const valid = validatePreset(preset);
const providers = toProviders(valid);

test("bundle patch preinstalls both routes and inserts the host row", () => {
  const entry = patch.find((row) => row.id === "llm-pi-ai");
  assert.ok(entry, "llm-pi-ai entry exists");
  assert.equal(entry.name, "@deepseek-ai/dsh-llm-pi-ai");
  assert.deepEqual(Object.keys(entry.config.providers).sort(), ["omnigate", "omnigate-claude"]);
  assert.equal(entry.config.providers.omnigate.api, "openai-responses");
  assert.equal(entry.config.providers["omnigate-claude"].api, "anthropic-messages");

  const insert = patch.find((row) => Array.isArray(row.insert));
  assert.ok(insert, "insert entry exists");
  const row = insert.insert.find((item) => item.id === "omnigate");
  assert.ok(row, "omnigate host row exists");
  assert.equal(row.name, "dsh-omnigate");
  assert.equal(row.config.baseURL, "https://gate.oky.su/v1");
  assert.equal(row.config.apiKeyEnv, "OMNIGATE_API_KEY");
  assert.match(row.config.presetURL, /cdn\.jsdelivr\.net/u);
  assert.match(row.config.presetURL, /presets\/omnigate-models\.json$/u);
});

test("the preset builds two routes and filters image models", () => {
  assert.deepEqual(Object.keys(providers).sort(), ["omnigate", "omnigate-claude"]);
  assert.equal(providers.omnigate.api, "openai-responses");
  assert.equal(providers["omnigate-claude"].api, "anthropic-messages");
  assert.equal(providers.omnigate.apiKeyEnv, "OMNIGATE_API_KEY");
  assert.equal(providers["omnigate-claude"].apiKeyEnv, "OMNIGATE_API_KEY");
  assert.equal(
    Object.values(providers).flatMap((route) => route.models).length,
    preset.models.length,
  );
  const ids = Object.values(providers).flatMap((route) => route.models.map((model) => model.id));
  for (const imageModel of ["gpt-image-2", "gpt-image-2.5-flare", "gpt-image-2.5-sunburst"]) {
    assert.equal(ids.includes(imageModel), false);
  }
});

test("every model declares input and at least one thinking level", () => {
  for (const route of Object.values(providers)) {
    for (const model of route.models) {
      assert.ok(model.reasoningEfforts, `${model.id} has reasoning efforts`);
      assert.ok(Object.keys(model.reasoningEfforts).some((level) => level !== "off"));
      assert.ok(Array.isArray(model.input) && model.input.length > 0);
      assert.ok(Number.isSafeInteger(model.contextWindow) && model.contextWindow > 0);
      assert.ok(Number.isSafeInteger(model.maxTokens) && model.maxTokens > 0);
    }
  }
});

test("merge keeps user edits and adds new upstream models", () => {
  const baseline = structuredClone(providers);
  const incoming = structuredClone(providers);
  incoming.omnigate.models.push({
    id: "brand-new-model",
    name: "Brand New",
    contextWindow: 128000,
    maxTokens: 8192,
    input: ["text"],
    reasoningEfforts: { low: "low", high: "high" },
  });
  const live = structuredClone(providers);
  live.omnigate.models[0] = { ...live.omnigate.models[0], name: "My Renamed Model" };
  live.omnigate.models.push({
    id: "user-model",
    name: "User Model",
    contextWindow: 4096,
    maxTokens: 1024,
    input: ["text"],
    reasoningEfforts: { low: "low" },
  });

  const merged = mergeProviders(live, incoming, baseline);
  assert.equal(merged.changed, true);
  const models = merged.providers.omnigate.models;
  assert.equal(models.find((model) => model.id === "user-model").name, "User Model");
  assert.equal(models.find((model) => model.id === live.omnigate.models[0].id).name, "My Renamed Model");
  assert.ok(models.some((model) => model.id === "brand-new-model"));
});

test("merge drops a removed upstream model only when it was untouched", () => {
  const baseline = structuredClone(providers);
  const incoming = structuredClone(providers);
  const removed = incoming.omnigate.models.shift();
  const live = structuredClone(providers);

  const merged = mergeProviders(live, incoming, baseline);
  assert.equal(merged.providers.omnigate.models.some((model) => model.id === removed.id), false);

  const edited = structuredClone(providers);
  edited.omnigate.models[0] = { ...edited.omnigate.models[0], name: "Keep Me" };
  const kept = mergeProviders(edited, incoming, baseline);
  assert.equal(kept.providers.omnigate.models.some((model) => model.id === removed.id), true);
});

test("merge preserves a user-edited route endpoint", () => {
  const baseline = structuredClone(providers);
  const incoming = structuredClone(providers);
  incoming.omnigate.baseURL = "https://new.example/v1";
  const live = structuredClone(providers);
  live.omnigate.baseURL = "https://my-proxy.example/v1";

  const merged = mergeProviders(live, incoming, baseline);
  assert.equal(merged.providers.omnigate.baseURL, "https://my-proxy.example/v1");
});

test("merge is a no-op when live configuration already matches", () => {
  const merged = mergeProviders(structuredClone(providers), structuredClone(providers), structuredClone(providers));
  assert.equal(merged.changed, false);
});
