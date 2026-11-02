import assert from "node:assert/strict";
import test from "node:test";

import { apply } from "../lib/index.js";

/** Build a fake host context and capture the registered routes. */
function harness({ key = "sk-test", account, fetchError, withLlm = false } = {}) {
  const routes = new Map();
  const directory = [];
  const ctx = {
    get(name) {
      if (name === "llm" && withLlm) {
        return {
          registerConfigurableProviders(entries) {
            directory.push(...entries);
            return () => {};
          },
        };
      }
      if (name !== "credentials") return undefined;
      return {
        async resolve(ref) {
          return key === null ? undefined : { value: key, ref };
        },
      };
    },
    effect(factory) {
      return factory();
    },
    webServer: {
      register(route) {
        routes.set(route.path, route.handler);
        return () => {};
      },
    },
    logger: { info() {}, warn() {} },
  };

  if (fetchError !== undefined) {
    globalThis.fetch = async () => {
      throw fetchError;
    };
  } else if (account !== undefined) {
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify(account);
      },
    });
  }

  apply(ctx, { presetURL: "", syncPreset: false });
  return { routes, directory };
}

/** Run a GET through one captured route and parse its JSON answer. */
async function get(handler) {
  let status = 0;
  let body = "";
  const res = {
    writeHead(nextStatus) {
      status = nextStatus;
    },
    end(chunk) {
      body = chunk;
    },
  };
  await handler({ method: "GET" }, res);
  return { status, body: JSON.parse(body) };
}

test("normalizes wallet, plan, and key limits", async () => {
  const { routes } = harness({
    account: {
      user: { id: "u1", displayName: "Okysu" },
      wallet: { balance: "12.5", reserved: "0.5", available: "12", currency: "USD" },
      subscriptions: [
        {
          plan: { id: "p1", name: "Symphony 交响" },
          status: "active",
          rules: [
            {
              id: "r1",
              label: "每月",
              limit: "100",
              used: "25",
              resetsAt: "2026-12-01T00:00:00Z",
            },
          ],
        },
      ],
      limits: {
        group: { name: "default", rpm: 60, rpd: 1000, dailySpend: "5", monthlySpend: "100" },
        usage: { dailySpent: "1.25", monthlySpent: "25", rpdUsed: 10 },
        keys: [{ id: "k1", name: "test", spendLimit: "50", spent: "1" }],
      },
      key: { id: "k1", name: "test", expiresAt: null },
    },
  });

  const { status, body } = await get(routes.get("/omnigate/status"));
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.user.displayName, "Okysu");
  assert.equal(body.wallet.available, 12);
  assert.equal(body.plan.name, "Symphony 交响");
  assert.equal(body.plan.rules[0].remaining, 75);
  assert.equal(body.limits.rpm, 60);
  assert.equal(body.limits.keys[0].spendLimit, 50);
});

test("reports a missing API key without calling fetch", async () => {
  const { routes } = harness({ key: null, account: {} });
  const { status, body } = await get(routes.get("/omnigate/status"));
  assert.equal(status, 502);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "missing_api_key");
  assert.match(body.error.message, /OmniGate/u);
});

test("reports a relay failure", async () => {
  const { routes } = harness({ fetchError: new Error("boom") });
  const { status, body } = await get(routes.get("/omnigate/status"));
  assert.equal(status, 502);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, "relay_error");
  assert.match(body.error.message, /boom/u);
});

test("serves the bundled preset with both routes", async () => {
  const { routes } = harness({ account: {} });
  const { status, body } = await get(routes.get("/omnigate/preset"));
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.source, "bundled");
  assert.deepEqual(Object.keys(body.providers).sort(), ["omnigate", "omnigate-claude"]);
  assert.equal(body.providers.omnigate.models.length, 13);
  assert.equal(body.providers["omnigate-claude"].models.length, 2);
  assert.equal(body.providers.omnigate.api, "openai-responses");
});

test("publishes the OmniGate setup entry for the Models page picker", () => {
  const { directory } = harness({ account: {}, withLlm: true });
  const entry = directory.find((row) => row.provider === "omnigate-setup");
  assert.ok(entry, "setup entry exists");
  assert.equal(entry.displayName, "OmniGate");
  assert.equal(entry.settingsNs, "llm-pi-ai");
  assert.deepEqual(entry.settingsPath, ["providers", "omnigate-setup"]);
  assert.equal(entry.declared, true);
});
