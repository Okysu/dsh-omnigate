/**
 * dsh-omnigate — host half.
 *
 * Three jobs:
 *   1. publish an `omnigate-setup` configurable-provider entry so the Models
 *      page lists "OmniGate" in its third-party provider picker;
 *   2. fetch `presets/omnigate-models.json` from jsDelivr at runtime (the
 *      bundled file is the offline fallback), expose it at
 *      `GET /omnigate/preset`, and keep an already-installed `llm-pi-ai`
 *      route in sync with the remote preset;
 *   3. proxy the OmniGate account endpoint (`GET /v1/account`) for the sidebar
 *      quota widget.
 *
 * The browser writes the provider profile through the authenticated
 * `remote.settings` / `remote.credentials` surfaces, so this plugin owns no
 * unauthenticated write route.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { mergeProviders, toProviders, validatePreset } from "./preset.js";

/** Loader row name; matches the package name. */
export const name = "dsh-omnigate";

/** Required services. `credentials`, `settings`, and `llm` are read via `ctx.get`. */
export const inject = ["webServer"];

const DEFAULT_BASE_URL = "https://gate.oky.su/v1";
const DEFAULT_PRESET_URL =
  "https://cdn.jsdelivr.net/gh/Okysu/dsh-omnigate@main/presets/omnigate-models.json";
// jsDelivr needs a moment to index a brand-new repository/branch; raw GitHub is
// the immediate fallback and also keeps working if jsDelivr is unavailable.
const DEFAULT_PRESET_FALLBACK_URL =
  "https://raw.githubusercontent.com/Okysu/dsh-omnigate/main/presets/omnigate-models.json";
const PRESET_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "presets",
  "omnigate-models.json",
);

/** The directory entry the Models page lists as "OmniGate". */
const SETUP_PROVIDER = "omnigate-setup";

/** Write one JSON response. */
function writeJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

/** Coerce a relay numeric string to a number, keeping `undefined` for junk. */
function num(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Resolve the relay key: credential store, then environment, then config. */
async function resolveApiKey(ctx, settings) {
  try {
    const credentials = ctx.get("credentials");
    if (credentials && typeof credentials.resolve === "function") {
      const hit = await credentials.resolve(settings.apiKeyEnv);
      if (hit && typeof hit.value === "string" && hit.value.trim() !== "") return hit.value.trim();
    }
  } catch {
    /* credential seam unavailable: fall through to the environment */
  }
  const fromEnv = process.env[settings.apiKeyEnv];
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return fromEnv.trim();
  if (settings.apiKey.trim() !== "") return settings.apiKey.trim();
  return undefined;
}

/** Read `GET <baseURL>/account` and answer the parsed body. */
async function fetchAccount(settings, key) {
  const url = new URL(`${settings.baseURL.replace(/\/+$/u, "")}/account`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), settings.timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${key}`,
        accept: "application/json",
      },
      signal: controller.signal,
    });
    const text = await response.text();
    let body;
    try {
      body = text === "" ? undefined : JSON.parse(text);
    } catch {
      body = undefined;
    }
    if (!response.ok) {
      const error = new Error(body?.error?.message ?? `relay HTTP ${response.status}`);
      error.code = body?.error?.code ?? `http_${response.status}`;
      error.status = response.status;
      throw error;
    }
    if (body === undefined || typeof body !== "object" || Array.isArray(body)) {
      const error = new Error("relay returned an invalid JSON body");
      error.code = "invalid_response";
      throw error;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

/** Normalize the account payload into the compact shape the widget renders. */
function normalizeAccount(account, fetchedAt) {
  const wallet = account?.wallet ?? {};
  const rawSubscriptions = Array.isArray(account?.subscriptions) ? account.subscriptions : [];

  /** Normalize one quota rule of one subscription. */
  const normalizeRule = (rule) => {
    const limit = num(rule?.limit);
    const used = num(rule?.used);
    const remaining =
      num(rule?.remaining) ??
      (limit !== undefined && used !== undefined ? limit - used : undefined);
    return {
      id: typeof rule?.id === "string" ? rule.id : "",
      label: typeof rule?.label === "string" ? rule.label : "",
      meter: typeof rule?.meter === "string" ? rule.meter : "",
      windowKind: typeof rule?.window?.kind === "string" ? rule.window.kind : "",
      windowDuration:
        typeof rule?.window?.duration === "string" ? rule.window.duration : "",
      windowEvery: typeof rule?.window?.every === "string" ? rule.window.every : "",
      windowUnit: typeof rule?.window?.unit === "string" ? rule.window.unit : "",
      limit,
      used,
      remaining,
      resetsAt: typeof rule?.resetsAt === "string" ? rule.resetsAt : null,
      exceeded: rule?.exceeded === true,
    };
  };

  // A user can hold several active subscriptions at once (for example a
  // replenishment pack plus a small emergency pack). Keep every one; the widget
  // weights them together and also lists them separately.
  const plans = rawSubscriptions
    .map((entry) => ({
      id: typeof entry?.plan?.id === "string" ? entry.plan.id : "",
      name: typeof entry?.plan?.name === "string" ? entry.plan.name : "",
      status: typeof entry?.status === "string" ? entry.status : "",
      startsAt: typeof entry?.startsAt === "string" ? entry.startsAt : null,
      endsAt: typeof entry?.endsAt === "string" ? entry.endsAt : null,
      rules: Array.isArray(entry?.rules) ? entry.rules.map(normalizeRule) : [],
    }))
    .sort((left, right) => {
      const active = (plan) => (plan.status === "active" ? 0 : 1);
      return active(left) - active(right);
    });

  const activePlans = plans.filter((entry) => entry.status === "active");
  const plan = activePlans[0] ?? plans[0] ?? null;

  const group = account?.limits?.group ?? {};
  const usage = account?.limits?.usage ?? {};
  const key = account?.key ?? {};

  const keyLimits = Array.isArray(account?.limits?.keys)
    ? account.limits.keys.map((entry) => ({
        id: typeof entry?.id === "string" ? entry.id : "",
        name: typeof entry?.name === "string" ? entry.name : "",
        spendLimit: num(entry?.spendLimit),
        spent: num(entry?.spent),
        resetsAt: typeof entry?.resetsAt === "string" ? entry.resetsAt : null,
      }))
    : [];

  return {
    ok: true,
    fetchedAt,
    user: {
      id: typeof account?.user?.id === "string" ? account.user.id : "",
      displayName: typeof account?.user?.displayName === "string" ? account.user.displayName : "",
    },
    wallet: {
      balance: num(wallet.balance),
      reserved: num(wallet.reserved),
      available: num(wallet.available),
      currency: typeof wallet.currency === "string" && wallet.currency !== "" ? wallet.currency : "USD",
    },
    key: {
      id: typeof key.id === "string" ? key.id : "",
      name: typeof key.name === "string" ? key.name : "",
      expiresAt: typeof key.expiresAt === "string" ? key.expiresAt : null,
      spendLimit: num(key.spendLimit),
      spent: num(key.spent),
      resetsAt: typeof key.resetsAt === "string" ? key.resetsAt : null,
    },
    plan,
    plans,
    quotaOverflow: typeof account?.quotaOverflow === "string" ? account.quotaOverflow : null,
    limits: {
      groupName: typeof group.name === "string" ? group.name : "",
      timezone: typeof group.timezone === "string" ? group.timezone : "",
      priceMultiplier: num(group.priceMultiplier),
      rpm: num(group.rpm),
      rpd: num(group.rpd),
      dailySpend: num(group.dailySpend),
      monthlySpend: num(group.monthlySpend),
      rpdUsed: num(usage.rpdUsed),
      dailySpent: num(usage.dailySpent),
      monthlySpent: num(usage.monthlySpent),
      resetsAt: {
        day: typeof usage?.resetsAt?.day === "string" ? usage.resetsAt.day : null,
        month: typeof usage?.resetsAt?.month === "string" ? usage.resetsAt.month : null,
      },
      keys: keyLimits,
    },
  };
}

/** Host-side cache shared by every request of this plugin instance. */
function createStatusReader(ctx, settings) {
  const cache = { at: 0, payload: undefined, key: undefined };

  const read = async () => {
    const now = Date.now();
    const ttl = Math.max(0, settings.cacheSeconds) * 1000;
    if (cache.payload !== undefined && now - cache.at < ttl) return cache.payload;

    const apiKey = await resolveApiKey(ctx, settings);
    if (apiKey === undefined) {
      return {
        ok: false,
        fetchedAt: now,
        error: {
          code: "missing_api_key",
          message: `未找到 API Key，请在「设置 → 模型 → OmniGate」中填写（凭据 ${settings.apiKeyEnv}）`,
        },
      };
    }
    cache.key = apiKey;

    try {
      const account = await fetchAccount(settings, apiKey);
      const payload = normalizeAccount(account, Date.now());
      cache.at = Date.now();
      cache.payload = payload;
      return payload;
    } catch (error) {
      const detail = {
        code: typeof error?.code === "string" ? error.code : "relay_error",
        message:
          error?.name === "AbortError"
            ? `请求中转站超时（${settings.timeoutMs}ms）`
            : String(error?.message ?? error),
      };
      if (cache.payload !== undefined) {
        return { ...cache.payload, stale: true, warning: detail };
      }
      return { ok: false, fetchedAt: now, error: detail };
    }
  };

  return { read };
}

/** Read the bundled preset once; it is the offline fallback and merge baseline. */
let bundledCache;
function loadBundledPreset() {
  if (bundledCache === undefined) {
    const parsed = JSON.parse(readFileSync(PRESET_PATH, "utf8"));
    const valid = validatePreset(parsed);
    bundledCache = { preset: parsed, providers: toProviders(valid) };
  }
  return bundledCache;
}

/** Fetch and validate one remote preset document. */
async function fetchPreset(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json", "user-agent": "dsh-omnigate" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`preset HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 1_000_000) throw new Error("preset response is too large");
    const parsed = JSON.parse(text);
    const valid = validatePreset(parsed);
    const revision = Number.isFinite(Number(parsed.revision)) ? Number(parsed.revision) : 0;
    return { preset: parsed, providers: toProviders(valid), revision };
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve the effective preset (newest of jsDelivr / raw GitHub, bundled fallback). */
function createPresetReader(settings) {
  let cached;
  let inflight;

  const read = () => {
    if (inflight !== undefined) return inflight;
    inflight = (async () => {
      const bundled = loadBundledPreset();
      const candidates = [settings.presetURL, settings.presetFallbackURL].filter(
        (url) => typeof url === "string" && url !== "",
      );
      // jsDelivr can serve a cached revision for a while after a push. Ask both
      // sources and keep the newest `revision`, so a stale CDN copy never
      // downgrades the installed provider profile.
      const attempts = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            const fetched = await fetchPreset(candidate, settings.presetTimeoutMs);
            return {
              ...fetched,
              url: candidate,
              source: candidate.includes("cdn.jsdelivr.net") ? "cdn" : "github",
              error: null,
            };
          } catch (failure) {
            return {
              url: candidate,
              source: candidate.includes("cdn.jsdelivr.net") ? "cdn" : "github",
              error:
                failure?.name === "AbortError"
                  ? `预设请求超时（${settings.presetTimeoutMs}ms）`
                  : String(failure?.message ?? failure),
            };
          }
        }),
      );
      const successes = attempts.filter((entry) => entry.preset !== undefined);
      successes.sort((left, right) => right.revision - left.revision);
      const newest = successes[0];
      const error = newest === undefined
        ? attempts.map((entry) => `${entry.source}: ${entry.error}`).join("; ") || null
        : null;
      const chosen = newest ?? bundled;
      cached = {
        preset: chosen.preset,
        providers: chosen.providers,
        baseline: bundled.providers,
        revision: newest?.revision ?? 0,
        source: newest?.source ?? "bundled",
        url: newest?.url,
        fetchedAt: Date.now(),
        error,
      };
      return cached;
    })().finally(() => {
      inflight = undefined;
    });
    return inflight;
  };

  return { read, current: () => cached };
}

/**
 * Merge the effective preset into an already-installed `llm-pi-ai` route set.
 * A profile that was never added is left alone (the Models page card adds it),
 * and user-edited fields/models survive the merge.
 */
async function syncInstalledRoutes(ctx, reader, settings) {
  if (!settings.syncPreset) return { synced: false, reason: "disabled" };
  const service = ctx.get("settings");
  if (service === undefined || typeof service.describe !== "function" || typeof service.update !== "function") {
    return { synced: false, reason: "no_settings" };
  }
  const descriptor = service.describe().find((row) => row.ns === "llm-pi-ai");
  if (descriptor === undefined) return { synced: false, reason: "no_llm_pi_ai" };

  const current = descriptor.value?.providers ?? {};
  if (current.omnigate === undefined && current["omnigate-claude"] === undefined) {
    return { synced: false, reason: "not_added" };
  }

  const live = await reader.read();
  const merged = mergeProviders(current, live.providers, live.baseline);
  if (!merged.changed) return { synced: false, reason: "up_to_date" };

  await service.update("llm-pi-ai", { providers: merged.providers }, descriptor.revision);
  return { synced: true, source: live.source };
}

/** Host plugin body. */
export function apply(ctx, config) {
  const settings = {
    baseURL:
      typeof config?.baseURL === "string" && config.baseURL.trim() !== ""
        ? config.baseURL.trim()
        : DEFAULT_BASE_URL,
    apiKeyEnv:
      typeof config?.apiKeyEnv === "string" && config.apiKeyEnv.trim() !== ""
        ? config.apiKeyEnv.trim()
        : "OMNIGATE_API_KEY",
    apiKey: typeof config?.apiKey === "string" ? config.apiKey : "",
    cacheSeconds:
      typeof config?.cacheSeconds === "number" && Number.isFinite(config.cacheSeconds)
        ? config.cacheSeconds
        : 15,
    timeoutMs:
      typeof config?.timeoutMs === "number" && Number.isFinite(config.timeoutMs)
        ? config.timeoutMs
        : 20000,
    presetURL:
      typeof config?.presetURL === "string"
        ? config.presetURL.trim()
        : DEFAULT_PRESET_URL,
    presetFallbackURL:
      typeof config?.presetFallbackURL === "string"
        ? config.presetFallbackURL.trim()
        : DEFAULT_PRESET_FALLBACK_URL,
    presetTimeoutMs:
      typeof config?.presetTimeoutMs === "number" && Number.isFinite(config.presetTimeoutMs)
        ? config.presetTimeoutMs
        : 8000,
    syncPreset: config?.syncPreset !== false,
  };

  const statusReader = createStatusReader(ctx, settings);
  const presetReader = createPresetReader(settings);

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "exact",
        path: "/omnigate/status",
        handler: async (req, res) => {
          if (req.method !== "GET" && req.method !== "HEAD") {
            writeJson(res, 405, {
              ok: false,
              error: { code: "method_not_allowed", message: "GET only" },
            });
            return;
          }
          try {
            const payload = await statusReader.read();
            writeJson(res, payload.ok ? 200 : 502, payload);
          } catch (error) {
            writeJson(res, 500, {
              ok: false,
              error: {
                code: "internal_error",
                message: String(error?.message ?? error),
              },
            });
          }
        },
      }),
    "dsh-omnigate: relay status route",
  );

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "exact",
        path: "/omnigate/preset",
        handler: async (req, res) => {
          if (req.method !== "GET" && req.method !== "HEAD") {
            writeJson(res, 405, {
              ok: false,
              error: { code: "method_not_allowed", message: "GET only" },
            });
            return;
          }
          try {
            const live = await presetReader.read();
            writeJson(res, 200, {
              ok: true,
              source: live.source,
              fetchedAt: live.fetchedAt,
              revision: live.revision,
              presetURL: settings.presetURL,
              presetFallbackURL: settings.presetFallbackURL,
              url: live.url,
              error: live.error,
              providers: live.providers,
              preset: live.preset,
            });
          } catch (error) {
            writeJson(res, 502, {
              ok: false,
              error: {
                code: "preset_error",
                message: String(error?.message ?? error),
              },
            });
          }
        },
      }),
    "dsh-omnigate: preset route",
  );

  // The Models page lists every declared provider that is not configured yet.
  // This dormant entry is the "OmniGate" option in the third-party picker; the
  // client card writes the real `omnigate` / `omnigate-claude` profiles.
  const llm = ctx.get("llm");
  if (llm !== undefined && typeof llm.registerConfigurableProviders === "function") {
    ctx.effect(
      () =>
        llm.registerConfigurableProviders([
          {
            provider: SETUP_PROVIDER,
            displayName: "OmniGate",
            settingsNs: "llm-pi-ai",
            settingsPath: ["providers", SETUP_PROVIDER],
            declared: true,
            defaultBaseURL: "https://gate.oky.su/v1",
          },
        ]),
      "dsh-omnigate: configurable provider entry",
    );
  }

  // Refresh the preset and sync an installed route set in the background. A
  // failed CDN read keeps the bundled preset; a settings write is idempotent,
  // so a reload after the write settles without another write.
  ctx.effect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await presetReader.read();
        if (cancelled) return;
        const result = await syncInstalledRoutes(ctx, presetReader, settings);
        if (!cancelled && result.synced) {
          ctx.logger?.info?.(`dsh-omnigate: synced preset from ${result.source}`);
        }
      } catch (error) {
        if (!cancelled) {
          ctx.logger?.warn?.(`dsh-omnigate: preset sync failed: ${String(error?.message ?? error)}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, "dsh-omnigate: preset sync");

  ctx.logger?.info?.("dsh-omnigate: serving /omnigate/status and /omnigate/preset");
}
