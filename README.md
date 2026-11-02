# dsh-omnigate

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 用的 **OmniGate 中转站插件**：

- 在 **设置 → 模型** 里预置两个 Provider：`OmniGate`（OpenAI Responses）与 `OmniGate Claude`（Anthropic Messages）。**用户只需要填 API Key**，Base URL、模型列表、上下文窗口、推理等级都从预设自动加载。
- 在 **添加模型提供商 → 第三方模型提供商** 的下拉框里也能看到 **OmniGate**；选中后会显示一键卡片，填 Key 即可重新写入预设。
- 预设文件 `presets/omnigate-models.json` 在运行时优先从 **jsDelivr CDN** 拉取，失败时回退到插件内置文件；已安装的 OmniGate 路由会自动跟随 CDN 更新（保留用户自定义的模型和字段）。
- 侧边栏额度挂件：钱包余额、套餐额度、Key 限额，和 `dsh-cat-quota` 一致，每 60 秒刷新。
- 允许在模型设置里添加任意自定义模型名（自定义模型 id + 上下文 + 推理等级）。

默认网关：`https://gate.oky.su`，兼容接口：

| 协议 | 路径 | 插件里的 Base URL |
|---|---|---|
| OpenAI Responses | `POST /v1/responses` | `https://gate.oky.su/v1` |
| Anthropic Messages | `POST /v1/messages` | `https://gate.oky.su` |
| 账户额度 | `GET /v1/account` | `https://gate.oky.su/v1` |

> 图片生成模型（`gpt-image-*`）已从预设中过滤，只保留 LLM / VLM。

## 安装

### 方式一：从 GitHub 安装（推荐）

在 DSH 的 **插件** 页面选择从 GitHub 安装，填入：

```
https://github.com/Okysu/dsh-omnigate
```

安装后确认 `dsh-omnigate` 这个 bundle 处于启用状态，然后刷新页面。插件管理会自动把包加入 profile 的依赖和 `dsh.profile.bundles`。

### 方式二：本地 link 安装

把仓库放到任意目录，例如 `C:\Users\you\Code\dsh-omnigate`，然后编辑当前 profile（`~/.dsh/profiles/desktop/package.json`）：

```json
{
  "dependencies": {
    "dsh-omnigate": "link:C:/Users/you/Code/dsh-omnigate"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-omnigate"
      ]
    }
  }
}
```

在 profile 目录执行：

```powershell
pnpm install
```

`dsh-omnigate` 必须排在 `@deepseek-ai/dsh-base` 之后，这样它的 bundle patch 才能覆盖 `llm-pi-ai` 的 provider 配置。

> 如果你不想改 `dsh.profile.bundles`，也可以把 `cordis.patch.yml` 里的两条 patch（`llm-pi-ai` 配置 + `omnigate` insert）手工复制到 profile 的 `cordis.patch.yml`；两种方式二选一。

## 使用

### 1. 填 API Key

打开 **设置 → 模型**，会看到两行：

- **OmniGate** —— GPT / DeepSeek / GLM 模型，走 OpenAI Responses。
- **OmniGate Claude** —— Claude Opus 5.5 / Sonnet 5.5，走 Anthropic Messages。

两行共用同一个凭据引用 `OMNIGATE_API_KEY`。在任意一行填入 API Key 并点 **应用**，另一行会自动显示已配置（绿色圆点）。

Base URL 已预置。需要改网关地址时，展开 **自定义设置** 修改：

- `OmniGate`：保持 `https://gate.oky.su/v1`（SDK 会追加 `/responses`）。
- `OmniGate Claude`：保持 `https://gate.oky.su`（SDK 会追加 `/v1/messages`）。

也可以在 **添加模型提供商 → 第三方模型提供商** 里选择 **OmniGate**：

- 卡片会出现在面板顶部，填 API Key 后点 **添加 OmniGate**，写入两条路由并保存 Key。
- 如果两条路由已经存在，卡片会显示“已添加”，按钮变为 **更新 API Key**，不会覆盖你已经改过的模型。

### 2. 选模型与推理等级

在输入框的模型选择器里选择 OmniGate 的模型。每个模型会按预设提供自己的推理等级：

| 模型 | 预设推理等级 |
|---|---|
| Claude Opus 5.5 / Sonnet 5.5 | low, medium, high, xhigh, max（adaptive thinking） |
| DeepSeek Flash / V4.1 Flash / V4 Pro | low, high, max |
| GLM-5.2（免费） | off, minimal, low, medium, high, xhigh, max |
| GLM-5.3-Flash / FlashX | low, high, max |
| GPT-5.6 Sol / Terra、GPT-6 Sol、GPT-6.1 Terra | off, low, medium, high, xhigh, max |
| GPT-6 Astra、GPT-6.1 Sol | low, medium, high, xhigh, max |

容量预设：

| 模型 | 上下文 | 最大输出 |
|---|---|---|
| Claude Opus 5.5 / Sonnet 5.5 | 1,000,000 | 128,000 |
| GPT-5.6 / GPT-6 / GPT-6.1 | 1,050,000 | 128,000 |
| GLM-5.2 / GLM-5.3 | 1,000,000 | 128,000 |
| DeepSeek Flash / V4 Pro / V4.1 Flash | 1,000,000 | 384,000 |

说明：

- Claude 5.5 使用 **adaptive thinking**（`thinking.type=adaptive` + `output_config.effort`），预设里带 `compat.forceAdaptiveThinking: true`；Opus 5.5 的思考不能关闭，所以没有 `off` 档。
- GPT-6 Astra / GPT-6.1 Sol 官方不支持 `none`，所以没有 `off` 档；其余 GPT 模型的 `off` 发送 `none`。
- DeepSeek 与 GLM-5.3 默认就开启思考，官方不接受 `off`，所以预设里没有这一档。
- 各等级的 wire 值就是官方名称（`none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`）。实际可用值以网关当前渠道为准；如果某个渠道拒绝，DSH 会把错误原样显示在对话里。

### 3. 自定义模型

在 **设置 → 模型 → OmniGate（或 OmniGate Claude）→ 自定义设置 → 模型** 里点 **添加模型**：

- `id` 必须和网关 `/v1/models` 里的模型名完全一致（例如 `my-model`）。
- 按需填显示名、上下文窗口、最大输出、输入类型（文本 / 图片）、推理等级。
- 自定义模型保存在 profile 的 `llm-pi-ai` 设置里，不会改插件文件。
- 运行时的 CDN 同步会保留你改过或新增的模型，只更新仍然等于内置预设的那部分。

也可以在 `presets/omnigate-models.json` 里加一条，然后：

```powershell
npm run build:preset
```

重新生成 `cordis.patch.yml`；重启 DSH 或触发配置重载后生效。若要让所有已安装用户自动收到更新，把 JSON 推到 GitHub 的 `main` 分支即可，插件会在下次启动时从 jsDelivr 拉取。

### 4. 余额挂件

侧边栏底部会多一个 **OmniGate** 额度入口：

- 圆环显示**加权剩余额度百分比**（按每条规则的上限加权）；展开后同时显示百分比和具体数值。
- **多个生效套餐**：主面板只显示优先级最高的一个套餐，底部 **查看更多** 会在右侧再弹出一个面板列出全部套餐；圆环和侧边栏百分比按全部生效套餐汇总。
- 套餐的 **5 小时 / 每周 / 每月 / 总额度** 等每条规则都会逐条显示：剩余百分比、进度条、`剩余 X / Y` 和重置时间。
- 钱包余额（`balance`）与可用余额（`available`）
- Key 限额：RPM / RPD、每日消费、每月消费、Key 消费上限、过期时间

点击展开详情，60 秒自动刷新，也可手动刷新。数据由 Host 进程请求：

```
GET https://gate.oky.su/v1/account
Authorization: Bearer <OMNIGATE_API_KEY>
```

Host 侧默认缓存 15 秒，避免轮询过密。

## 预设 JSON 与 CDN

`presets/omnigate-models.json` 是唯一数据源：

```json
{
  "version": 1,
  "apiKeyEnv": "OMNIGATE_API_KEY",
  "routes": {
    "omnigate": { "displayName": "OmniGate", "api": "openai-responses", "baseURL": "https://gate.oky.su/v1" },
    "omnigate-claude": { "displayName": "OmniGate Claude", "api": "anthropic-messages", "baseURL": "https://gate.oky.su" }
  },
  "models": [
    {
      "id": "gpt-6-sol",
      "name": "GPT-6 Sol",
      "vendor": "OpenAI",
      "route": "omnigate",
      "contextWindow": 1000000,
      "maxTokens": 128000,
      "input": ["text", "image"],
      "reasoningEfforts": { "off": "none", "minimal": "minimal", "low": "low", "medium": "medium", "high": "high" },
      "description": "..."
    }
  ]
}
```

运行时顺序：

1. 同时请求 `https://cdn.jsdelivr.net/gh/Okysu/dsh-omnigate@main/presets/omnigate-models.json` 与 `https://raw.githubusercontent.com/Okysu/dsh-omnigate/main/presets/omnigate-models.json`
2. 取 `revision` 较大的那一份；两者相同则优先用 jsDelivr。这样 jsDelivr 还没索引到最新提交时，不会用旧缓存覆盖新配置
3. 两者都失败、超时或校验不通过时，使用插件内置的 `presets/omnigate-models.json`
4. 对已安装的 `omnigate` / `omnigate-claude` 路由做合并同步：用户改过的字段与模型保留，只更新仍等于内置预设的部分

`GET /omnigate/preset` 会返回当前生效的预设、`providers`、`revision`、`source`（`cdn` / `github` / `bundled`）以及实际命中的 `url`，方便排查。

> 修改预设内容时请递增 JSON 顶层的 `revision`，否则运行时可能把旧缓存当成同样新的版本。

| 字段 | 说明 |
|---|---|
| `version` | 目前固定为 `1` |
| `revision` | 预设内容版本号；修改模型/等级/容量时递增，运行时取 CDN 与 raw GitHub 中较大者 |
| `apiKeyEnv` | 凭据引用名；默认 `OMNIGATE_API_KEY` |
| `routes` | provider id → `displayName` / `api` / `baseURL` |
| `models[].id` | 网关模型名，必须完全一致 |
| `models[].route` | 属于哪个 route |
| `models[].contextWindow` / `maxTokens` | DSH 用于上下文与输出上限 |
| `models[].input` | `text` / `image` |
| `models[].reasoningEfforts` | 等级 → wire 值；`off` 可为 `null` |
| `models[].description` | 仅作文档说明，不进入 DSH 配置 |

生成脚本会做完整校验：重复 id、未知 route、非法协议、非法等级、空推理档位都会直接报错并指出位置。

## 高级配置：Host 行

额度挂件、预设同步与目录项的 Host 行在 `cordis.patch.yml` 的 `insert` 里，可以在 profile 的 `cordis.patch.yml` 覆盖：

```yaml
- id: omnigate
  config:
    baseURL: https://gate.oky.su/v1
    apiKeyEnv: OMNIGATE_API_KEY
    presetURL: https://cdn.jsdelivr.net/gh/Okysu/dsh-omnigate@main/presets/omnigate-models.json
    presetFallbackURL: https://raw.githubusercontent.com/Okysu/dsh-omnigate/main/presets/omnigate-models.json
    presetTimeoutMs: 8000
    syncPreset: true
    cacheSeconds: 15
    timeoutMs: 20000
```

| 字段 | 默认 | 说明 |
|---|---|---|
| `baseURL` | `https://gate.oky.su/v1` | 账户接口基址，会拼接 `/account` |
| `apiKeyEnv` | `OMNIGATE_API_KEY` | 凭据引用 |
| `apiKey` | 空 | 不推荐；直接写在配置里的兜底 key |
| `presetURL` | jsDelivr 地址 | 预设 CDN；设为空字符串则跳过 |
| `presetFallbackURL` | raw GitHub 地址 | jsDelivr 未索引或不可用时的回退；设为空字符串则跳过 |
| `presetTimeoutMs` | `8000` | 单次预设请求超时 |
| `syncPreset` | `true` | 是否把 CDN 预设合并到已安装路由 |
| `cacheSeconds` | `15` | 额度缓存秒数 |
| `timeoutMs` | `20000` | 额度请求超时 |

## 卸载

在 **插件** 页面关闭 / 移除 `dsh-omnigate`，或从 profile 的 `dsh.profile.bundles` 里删掉它。已写入的 `llm-pi-ai` 用户设置不会自动删除；如需彻底清理，在模型设置里删除 OmniGate 两行，并删除凭据 `OMNIGATE_API_KEY`。

## 已知限制

- **用户级 `llm-pi-ai` 设置会整段覆盖 bundle 预设**。如果你之前已经手写过 `llm-pi-ai.providers`，安装后 OmniGate 不会自动出现；请使用下拉框里的 **OmniGate** 一键卡片添加。
- **下拉框里的 OmniGate 是安装入口**，目录项 `omnigate-setup` 不会变成真正的模型路由；真正的路由是 `omnigate` 与 `omnigate-claude`。
- **图片生成模型不包含**。本插件只面向 LLM / VLM；`gpt-image-*` 被过滤。
- **推理等级只是建议值**。网关可能按渠道把 `max` 映射为 `high`，也可能拒绝某个等级；以实际返回为准。
- **免费模型共享限额**。`deepseek-flash:free`、`glm-5.2:free` 全站共享调用限额，可能限流或排队。
- **额度挂件与模型 Provider 的 Base URL 分开配置**。模型页改的是 `llm-pi-ai` 的 `baseURL`；挂件走 Host 行自己的 `baseURL`。

## 开发

```powershell
npm install
npm test          # host 路由 + 预设校验/合并
npm run build:preset
```

目录：

```
lib/index.js              Host：额度接口、CDN 预设、目录项、自动同步
lib/preset.js             预设校验 / providers 转换 / 合并
lib/client.js             侧边栏额度挂件 + 模型页 OmniGate 一键卡片
presets/omnigate-models.json  预设（唯一数据源）
scripts/build-preset.mjs  生成 cordis.patch.yml
cordis.patch.yml          由脚本生成，勿手改
```

## License

MIT © 2026 Okysu
