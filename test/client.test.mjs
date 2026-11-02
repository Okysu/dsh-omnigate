import assert from "node:assert/strict";
import test from "node:test";

/** Minimal browser globals the client module needs at load time. */
function installGlobals() {
  const style = { id: "", textContent: "", dataset: {} };
  globalThis.document = {
    getElementById() {
      return null;
    },
    createElement() {
      return { ...style, dataset: {} };
    },
    head: { appendChild() {} },
  };
  let loaded;
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        loaded = definition;
      },
    },
  };
  globalThis.__loaded = () => loaded;
}

test("client plugin registers the quota widget and the OmniGate setup card", async () => {
  installGlobals();
  const React = {
    Fragment: Symbol("Fragment"),
    createElement() {
      return {};
    },
    useState(value) {
      return [value, () => {}];
    },
    useEffect() {},
    useLayoutEffect() {},
    useRef() {
      return { current: null };
    },
    useCallback(fn) {
      return fn;
    },
  };
  await import(`../lib/client.js?test=${Date.now()}`);
  const definition = globalThis.__loaded();
  assert.ok(definition, "module loader definition exists");

  const module = definition.factory((name) => {
    if (name === "react") return React;
    throw new Error(`unexpected require(${name})`);
  });
  assert.equal(typeof module.apply, "function");

  const registrations = [];
  const ctx = {
    slots: {
      inject(_name, callback) {
        callback();
      },
      register(options, component) {
        registrations.push({ options, component });
        return () => {};
      },
    },
    locale: {
      register() {
        return () => {};
      },
    },
    effect(factory) {
      return factory();
    },
    remote: {},
  };
  module.apply(ctx);

  assert.equal(registrations.length, 2);
  const quota = registrations.find((entry) => entry.options.name === "sidebar.footer.action");
  const setup = registrations.find((entry) => entry.options.name === "settings.models.provider-card");
  assert.ok(quota, "quota slot registered");
  assert.equal(setup.options.key, "llm-pi-ai");
  assert.equal(typeof setup.component, "function");

  const { remainingRatioOf, weightedRemainingRatio, percentText, ruleLabelOf } = module.__internals;
  assert.equal(remainingRatioOf({ limit: 100, used: 25 }), 0.75);
  assert.equal(remainingRatioOf({ limit: 100, remaining: 25 }), 0.25);
  assert.equal(
    weightedRemainingRatio([
      { limit: 100, remaining: 50 },
      { limit: 1000, remaining: 900 },
      { limit: 5000, remaining: 4000 },
    ]),
    4950 / 6100,
  );
  assert.equal(percentText(4950 / 6100), "81%");
  const translator = (key) => key;
  assert.equal(ruleLabelOf({ windowDuration: "PT5H", label: "" }, translator), "window5h");
  assert.equal(ruleLabelOf({ windowDuration: "P7D", label: "" }, translator), "windowWeek");
  assert.equal(ruleLabelOf({ windowDuration: "P30D", label: "" }, translator), "windowMonth");
  assert.equal(ruleLabelOf({ windowKind: "total", label: "" }, translator), "windowTotal");
  assert.equal(ruleLabelOf({ windowKind: "period", windowEvery: "30d", label: "" }, translator), "windowMonth");
  assert.equal(ruleLabelOf({ windowKind: "calendar", windowUnit: "week", label: "" }, translator), "windowWeek");
  assert.equal(ruleLabelOf({ windowKind: "lifetime", label: "" }, translator), "windowTotal");
  assert.equal(ruleLabelOf({ windowKind: "session", windowDuration: "5h", label: "" }, translator), "window5h");
});
