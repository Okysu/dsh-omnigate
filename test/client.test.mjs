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
});
