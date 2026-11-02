/**
 * Shared preset schema for `presets/omnigate-models.json`.
 *
 * Both the build script (which emits `cordis.patch.yml`) and the host plugin
 * (which fetches the same file from jsDelivr at startup) validate and convert
 * presets here, so a preset that can be built is exactly a preset that can be
 * synced at runtime.
 */

export const LEVELS = new Set(["off", "minimal", "low", "medium", "high", "xhigh", "max"]);
export const PROTOCOLS = new Set(["openai-responses", "openai-completions", "anthropic-messages"]);
const INPUTS = new Set(["text", "image"]);

/** Fields a route may carry from the preset into `llm-pi-ai`. */
const ROUTE_FIELDS = [
  "displayName",
  "apiKeyEnv",
  "api",
  "baseURL",
  "defaultContextWindow",
  "defaultMaxTokens",
  "defaultInput",
  "compat",
];

/** JSON round-trip deep equality for JSON-shaped values. */
export function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Validate one preset object.
 * @param preset - parsed JSON.
 * @returns `{ preset, routes, modelsByRoute }` on success.
 * @throws Error naming the first invalid entry.
 */
export function validatePreset(preset) {
  if (preset === null || typeof preset !== "object" || Array.isArray(preset)) {
    throw new Error("preset must be a JSON object");
  }
  if (preset.version !== 1) throw new Error(`unsupported preset version ${JSON.stringify(preset.version)}`);
  if (typeof preset.apiKeyEnv !== "string" || preset.apiKeyEnv.trim() === "") {
    throw new Error("apiKeyEnv must be a non-empty credential reference");
  }
  if (preset.routes === null || typeof preset.routes !== "object" || Array.isArray(preset.routes)) {
    throw new Error("routes must be an object keyed by provider id");
  }
  const routeIds = Object.keys(preset.routes);
  if (routeIds.length === 0) throw new Error("routes must declare at least one provider");

  for (const [routeId, route] of Object.entries(preset.routes)) {
    if (!/^[a-z][a-z0-9-]*$/.test(routeId)) throw new Error(`route id "${routeId}" must be lowercase kebab-case`);
    if (route === null || typeof route !== "object" || Array.isArray(route)) {
      throw new Error(`route "${routeId}" must be an object`);
    }
    if (typeof route.displayName !== "string" || route.displayName === "") {
      throw new Error(`route "${routeId}": displayName must be a non-empty string`);
    }
    if (!PROTOCOLS.has(route.api)) throw new Error(`route "${routeId}": unsupported api ${JSON.stringify(route.api)}`);
    if (typeof route.baseURL !== "string" || !/^https?:\/\//.test(route.baseURL)) {
      throw new Error(`route "${routeId}": baseURL must be an http(s) URL`);
    }
  }

  if (!Array.isArray(preset.models) || preset.models.length === 0) throw new Error("models must be a non-empty array");

  const seen = new Set();
  const modelsByRoute = new Map(routeIds.map((id) => [id, []]));

  for (const [index, model] of preset.models.entries()) {
    const where = `models[${index}]`;
    if (model === null || typeof model !== "object" || Array.isArray(model)) throw new Error(`${where} must be an object`);
    if (typeof model.id !== "string" || model.id.trim() === "") throw new Error(`${where}: id must be a non-empty string`);
    if (seen.has(model.id)) throw new Error(`${where}: duplicate model id ${JSON.stringify(model.id)}`);
    seen.add(model.id);
    if (typeof model.name !== "string" || model.name.trim() === "") throw new Error(`${where}: name must be a non-empty string`);
    if (!Object.hasOwn(preset.routes, model.route)) throw new Error(`${where}: unknown route ${JSON.stringify(model.route)}`);
    if (!Number.isSafeInteger(model.contextWindow) || model.contextWindow <= 0) {
      throw new Error(`${where}: contextWindow must be a positive integer`);
    }
    if (!Number.isSafeInteger(model.maxTokens) || model.maxTokens <= 0) {
      throw new Error(`${where}: maxTokens must be a positive integer`);
    }
    if (!Array.isArray(model.input) || model.input.length === 0) throw new Error(`${where}: input must be a non-empty array`);
    for (const modality of model.input) {
      if (!INPUTS.has(modality)) throw new Error(`${where}: unsupported input ${JSON.stringify(modality)}`);
    }
    if (model.reasoningEfforts === null || typeof model.reasoningEfforts !== "object" || Array.isArray(model.reasoningEfforts)) {
      throw new Error(`${where}: reasoningEfforts must be an object`);
    }
    const efforts = Object.entries(model.reasoningEfforts);
    if (efforts.length === 0) throw new Error(`${where}: reasoningEfforts must not be empty`);
    for (const [level, wire] of efforts) {
      if (!LEVELS.has(level)) throw new Error(`${where}: unknown reasoning level ${JSON.stringify(level)}`);
      if (level === "off") {
        if (wire !== null && typeof wire !== "string") throw new Error(`${where}: off must be null or a string`);
      } else if (typeof wire !== "string" || wire.trim() === "") {
        throw new Error(`${where}: ${level} needs a non-empty wire value`);
      }
    }
    if (!efforts.some(([level]) => level !== "off")) {
      throw new Error(`${where}: at least one reasoning level besides off is required`);
    }
    if (model.compat !== undefined && (model.compat === null || typeof model.compat !== "object" || Array.isArray(model.compat))) {
      throw new Error(`${where}: compat must be an object when present`);
    }
    modelsByRoute.get(model.route).push(model);
  }

  for (const [routeId, models] of modelsByRoute) {
    if (models.length === 0) throw new Error(`route "${routeId}" has no models`);
  }

  return { preset, routes: preset.routes, modelsByRoute, routeIds };
}

/** Convert one validated model into the `llm-pi-ai` model entry shape. */
function modelEntry(model) {
  return {
    id: model.id,
    name: model.name,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
    input: [...model.input],
    reasoningEfforts: { ...model.reasoningEfforts },
    ...(model.compat === undefined ? {} : { compat: { ...model.compat } }),
  };
}

/**
 * Convert a validated preset into the `llm-pi-ai` provider dictionary.
 * @param valid - result of {@link validatePreset}.
 */
export function toProviders(valid) {
  const providers = {};
  for (const routeId of valid.routeIds) {
    const route = valid.routes[routeId];
    providers[routeId] = {
      displayName: route.displayName,
      apiKeyEnv: valid.preset.apiKeyEnv,
      api: route.api,
      baseURL: route.baseURL,
      models: valid.modelsByRoute.get(routeId).map(modelEntry),
    };
  }
  return providers;
}

/**
 * Merge one incoming preset into the live `llm-pi-ai.providers` dictionary.
 *
 * The incoming preset is authoritative for fields and models that still match
 * the bundled baseline (i.e. the user never touched them). Anything the user
 * changed or added is preserved; models removed from the upstream preset are
 * dropped only when they still match the baseline.
 *
 * @param current - live provider dictionary, or undefined on first install.
 * @param incoming - providers built from the fetched preset.
 * @param baseline - providers built from the bundled preset.
 * @returns `{ providers, changed }` where `providers` holds only the incoming routes.
 */
export function mergeProviders(current, incoming, baseline) {
  const live = current !== null && typeof current === "object" && !Array.isArray(current) ? current : {};
  const base = baseline !== null && typeof baseline === "object" && !Array.isArray(baseline) ? baseline : {};
  const providers = {};
  let changed = false;

  for (const [routeId, nextRoute] of Object.entries(incoming)) {
    const liveRoute = live[routeId];
    const baseRoute = base[routeId];

    if (liveRoute === null || typeof liveRoute !== "object" || Array.isArray(liveRoute)) {
      providers[routeId] = nextRoute;
      changed = true;
      continue;
    }

    const merged = { ...liveRoute };

    for (const field of ROUTE_FIELDS) {
      const liveValue = liveRoute[field];
      const baseValue = baseRoute?.[field];
      const untouched = liveValue === undefined || baseValue === undefined || sameJson(liveValue, baseValue);
      if (untouched && !sameJson(liveValue, nextRoute[field])) {
        if (nextRoute[field] === undefined) delete merged[field];
        else merged[field] = nextRoute[field];
      }
    }

    const liveModels = Array.isArray(liveRoute.models) ? liveRoute.models : [];
    const baseModels = Array.isArray(baseRoute?.models) ? baseRoute.models : [];
    const nextModels = Array.isArray(nextRoute.models) ? nextRoute.models : [];
    const nextById = new Map(nextModels.map((model) => [model.id, model]));
    const baseById = new Map(baseModels.map((model) => [model.id, model]));
    const kept = [];

    for (const liveModel of liveModels) {
      if (liveModel === null || typeof liveModel !== "object" || Array.isArray(liveModel)) {
        kept.push(liveModel);
        continue;
      }
      const nextModel = nextById.get(liveModel.id);
      if (nextModel !== undefined) {
        const baseModel = baseById.get(liveModel.id);
        kept.push(baseModel !== undefined && sameJson(liveModel, baseModel) ? nextModel : liveModel);
      } else if (baseById.has(liveModel.id)) {
        if (!sameJson(liveModel, baseById.get(liveModel.id))) kept.push(liveModel);
      } else {
        kept.push(liveModel);
      }
    }

    const seen = new Set(kept.map((model) => (model !== null && typeof model === "object" ? model.id : undefined)));
    for (const nextModel of nextModels) if (!seen.has(nextModel.id)) kept.push(nextModel);

    if (!sameJson(liveModels, kept)) merged.models = kept;

    if (!sameJson(liveRoute, merged)) changed = true;
    providers[routeId] = merged;
  }

  return { providers, changed };
}
