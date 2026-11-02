window.__ModuleLoader__.load({
	id: "dsh-omnigate",
	factory: (require) => {
		"use strict";
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");

		//#region dsh-omnigate: styles
		const STYLE_ID = "dsh-omnigate-style";
		if (typeof document !== "undefined" && document.getElementById(STYLE_ID) === null) {
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = [
				".dsh-omnigate-trigger{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;min-width:0;height:46px;margin:2px 0;padding:0 10px 0 8px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary,#f9fafb);font:inherit;cursor:pointer;text-align:left}",
				".dsh-omnigate-trigger:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.16))}",
				".dsh-omnigate-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:-2px}",
				".dsh-omnigate-trigger[data-rail=\"true\"]{width:36px;height:36px;padding:0;justify-content:center;position:relative}",
				".dsh-omnigate-icon{flex:none;display:inline-flex;align-items:center;justify-content:center}",
				".dsh-omnigate-body{display:flex;flex-direction:column;flex:1;min-width:0;gap:1px}",
				".dsh-omnigate-line{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}",
				".dsh-omnigate-name{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#adb2b8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dsh-omnigate-value{font-size:13px;line-height:17px;font-variant-numeric:tabular-nums;white-space:nowrap}",
				".dsh-omnigate-sub{font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary,#8b8f94);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
				".dsh-omnigate-dot{position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:#f5a524}",
				".dsh-omnigate-dot[data-error=\"true\"]{background:#f97066}",
				".dsh-omnigate-panel{position:fixed;z-index:1400;box-sizing:border-box;width:292px;max-height:min(72vh,560px);overflow:auto;padding:12px;border:1px solid var(--dsw-alias-border-l2,rgba(255,255,255,.12));border-radius:var(--dsw-radius-panel,12px);background:var(--dsw-alias-bg-layer-2,#1f2023);color:var(--dsw-alias-label-primary,#f9fafb);box-shadow:var(--dsw-elevation-prominent,0 12px 32px rgba(0,0,0,.45));font-size:12px}",
				".dsh-omnigate-header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}",
				".dsh-omnigate-title{font-size:14px;font-weight:600;line-height:20px}",
				".dsh-omnigate-refresh{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#adb2b8);font:inherit;font-size:12px;padding:3px 7px;cursor:pointer}",
				".dsh-omnigate-refresh:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.16))}",
				".dsh-omnigate-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:3px 0}",
				".dsh-omnigate-label{flex:none;font-size:12px;color:var(--dsw-alias-label-secondary,#adb2b8)}",
				".dsh-omnigate-text{min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:12px;text-align:right;font-variant-numeric:tabular-nums}",
				".dsh-omnigate-sep{height:1px;margin:7px 0;background:var(--dsw-alias-border-l2,rgba(255,255,255,.12))}",
				".dsh-omnigate-rule-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:3px 0 1px}",
				".dsh-omnigate-bar{height:6px;margin:4px 0 3px;border-radius:999px;background:var(--dsw-alias-bg-layer-3,rgba(255,255,255,.12));overflow:hidden}",
				".dsh-omnigate-bar-inner{height:100%;border-radius:999px;background:var(--dsw-alias-brand-primary,#4d6bfe);transition:width .2s ease}",
				".dsh-omnigate-bar-inner[data-low=\"true\"]{background:#f5a524}",
				".dsh-omnigate-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8b8f94)}",
				".dsh-omnigate-error{font-size:12px;line-height:18px;color:#f97066;word-break:break-word}",
				".dsh-omnigate-warn{font-size:11px;line-height:16px;color:#f5a524;word-break:break-word}",
				".dsh-omnigate-chip{display:inline-block;margin-left:6px;padding:0 6px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.18));font-size:10px;line-height:15px;color:var(--dsw-alias-label-secondary,#adb2b8)}",
				".dsh-omnigate-setup{display:flex;flex-direction:column;gap:8px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.24));border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-bg-module-platform,rgba(128,128,128,.06))}",
				".dsh-omnigate-setup-title{font-size:13px;font-weight:600;line-height:19px;color:var(--dsw-alias-label-primary,#f9fafb)}",
				".dsh-omnigate-setup-text{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary,#8b8f94)}",
				".dsh-omnigate-setup-field{display:flex;flex-direction:column;gap:4px}",
				".dsh-omnigate-setup-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#adb2b8)}",
				".dsh-omnigate-setup-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l4,rgba(128,128,128,.32));border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111);font:inherit;font-size:13px}",
				".dsh-omnigate-setup-input:focus{border-color:var(--dsw-alias-state-business-primary,#4d6bfe);outline:none}",
				".dsh-omnigate-setup-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
				".dsh-omnigate-setup-button{box-sizing:border-box;height:30px;padding:0 12px;border:0;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-button-primary-fill,#111);color:var(--dsw-alias-label-primary-foreground,#fff);font:inherit;font-size:12px;cursor:pointer}",
				".dsh-omnigate-setup-button:disabled{opacity:.5;cursor:default}",
				".dsh-omnigate-setup-ok{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-success-primary,#2f9e44)}",
			].join("\n");
			document.head.appendChild(style);
		}
		//#endregion

		//#region dsh-omnigate: dictionaries
		const NS = "omnigate";
		const zh = {
			"title": "OmniGate",
			"details": "OmniGate 额度",
			"available": "可用",
			"wallet": "钱包余额",
			"reserved": "冻结金额",
			"plan": "套餐",
			"noPlan": "无套餐",
			"planRemaining": "剩余",
			"resetsAt": "重置时间",
			"keyLimits": "Key 限额",
			"keySpendLimit": "Key 消费上限",
			"keyExpires": "Key 过期",
			"dailySpend": "每日消费",
			"monthlySpend": "每月消费",
			"unlimited": "无限制",
			"never": "永不过期",
			"refresh": "刷新",
			"loading": "加载中…",
			"updatedAt": "更新于",
			"error": "读取失败",
			"stale": "数据可能已过期",
			"remaining": "剩余",
			"used": "已用",
			"rpm": "每分钟",
			"rpd": "每日",
			"expired": "已过期",
			"active": "生效中",
			"inactive": "未生效",
			"close": "关闭",
		};
		const en = {
			"title": "OmniGate",
			"details": "OmniGate quota",
			"available": "Available",
			"wallet": "Wallet",
			"reserved": "Reserved",
			"plan": "Plan",
			"noPlan": "No plan",
			"planRemaining": "Left",
			"resetsAt": "Resets",
			"keyLimits": "Key limits",
			"keySpendLimit": "Key spend cap",
			"keyExpires": "Key expires",
			"dailySpend": "Daily spend",
			"monthlySpend": "Monthly spend",
			"unlimited": "Unlimited",
			"never": "Never",
			"refresh": "Refresh",
			"loading": "Loading…",
			"updatedAt": "Updated",
			"error": "Failed to load",
			"stale": "Data may be stale",
			"remaining": "left",
			"used": "used",
			"rpm": "per minute",
			"rpd": "per day",
			"expired": "Expired",
			"active": "Active",
			"inactive": "Inactive",
			"close": "Close",
		};
		//#endregion

		//#region dsh-omnigate: formatting
		function makeTranslator(t) {
			return (key, fallback) => {
				if (typeof t === "function") {
					const translated = t(key);
					if (typeof translated === "string" && translated !== "" && translated !== key) return translated;
				}
				return zh[key] ?? fallback ?? key;
			};
		}

		function money(value, currency) {
			if (typeof value !== "number" || !Number.isFinite(value)) return "—";
			const code = typeof currency === "string" && currency !== "" ? currency : "USD";
			try {
				return new Intl.NumberFormat(undefined, {
					style: "currency",
					currency: code,
					maximumFractionDigits: Math.abs(value) < 1 ? 4 : 2,
				}).format(value);
			} catch {
				return `${value.toFixed(2)} ${code}`;
			}
		}

		function amount(value) {
			if (typeof value !== "number" || !Number.isFinite(value)) return "—";
			if (Number.isInteger(value)) return String(value);
			if (Math.abs(value) >= 1000) return String(Math.round(value));
			if (Math.abs(value) >= 100) return value.toFixed(0);
			if (Math.abs(value) >= 1) return value.toFixed(2);
			return value.toFixed(4);
		}

		function shortTime(iso) {
			if (typeof iso !== "string" || iso === "") return "—";
			const date = new Date(iso);
			if (Number.isNaN(date.getTime())) return "—";
			const pad = (value) => String(value).padStart(2, "0");
			return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}

		function clockTime(ms) {
			const date = new Date(typeof ms === "number" ? ms : Date.now());
			const pad = (value) => String(value).padStart(2, "0");
			return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
		}

		function ratioOf(rule) {
			if (rule === null || rule === undefined) return undefined;
			if (typeof rule.limit === "number" && rule.limit > 0) {
				if (typeof rule.used === "number") return Math.min(1, Math.max(0, rule.used / rule.limit));
				if (typeof rule.remaining === "number") return Math.min(1, Math.max(0, (rule.limit - rule.remaining) / rule.limit));
			}
			return undefined;
		}
		//#endregion

		//#region dsh-omnigate: data
		const POLL_MS = 60000;

		function useStatus() {
			const [state, setState] = React.useState({ phase: "loading" });
			const [tick, setTick] = React.useState(0);

			React.useEffect(() => {
				const controller = new AbortController();
				let alive = true;
				(async () => {
					try {
						const response = await fetch("/omnigate/status", {
							method: "GET",
							headers: { accept: "application/json" },
							cache: "no-store",
							signal: controller.signal,
						});
						const body = await response.json().catch(() => undefined);
						if (!alive) return;
						if (body !== undefined && body !== null && body.ok === true) {
							setState({ phase: "ready", data: body, at: Date.now() });
						} else {
							setState((previous) => ({
								phase: "error",
								data: previous.phase === "ready" ? previous.data : undefined,
								error: body?.error?.message ?? `HTTP ${response.status}`,
							}));
						}
					} catch (error) {
						if (!alive || controller.signal.aborted) return;
						setState((previous) => previous.phase === "ready"
							? { ...previous, stale: true, warning: String(error?.message ?? error) }
							: { phase: "error", error: String(error?.message ?? error) });
					}
				})();
				return () => {
					alive = false;
					controller.abort();
				};
			}, [tick]);

			React.useEffect(() => {
				const timer = setInterval(() => setTick((value) => value + 1), POLL_MS);
				const onVisible = () => {
					if (document.visibilityState === "visible") setTick((value) => value + 1);
				};
				document.addEventListener("visibilitychange", onVisible);
				return () => {
					clearInterval(timer);
					document.removeEventListener("visibilitychange", onVisible);
				};
			}, []);

			const refresh = React.useCallback(() => setTick((value) => value + 1), []);
			return { ...state, refresh };
		}
		//#endregion

		//#region dsh-omnigate: icons
		function GaugeIcon({ size }) {
			return React.createElement(
				"svg",
				{
					width: size,
					height: size,
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.7,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
				},
				React.createElement("path", { d: "M4 18a9 9 0 1 1 16 0" }),
				React.createElement("path", { d: "M12 18l4.2-6" }),
				React.createElement("circle", { cx: 12, cy: 18, r: 1.5, fill: "currentColor", stroke: "none" }),
			);
		}
		//#endregion

		//#region dsh-omnigate: panel
		function Row({ label, value, title }) {
			return React.createElement(
				"div",
				{ className: "dsh-omnigate-row", title: typeof title === "string" ? title : undefined },
				React.createElement("span", { className: "dsh-omnigate-label" }, label),
				React.createElement("span", { className: "dsh-omnigate-text" }, value),
			);
		}

		function RuleBlock({ rule, tr }) {
			const ratio = ratioOf(rule);
			const label = rule.label !== "" ? rule.label : rule.id !== "" ? rule.id : tr("planRemaining");
			let value;
			if (typeof rule.limit === "number" && typeof rule.remaining === "number") {
				value = `${tr("remaining")} ${amount(rule.remaining)} / ${amount(rule.limit)}`;
			} else if (typeof rule.remaining === "number") {
				value = `${tr("remaining")} ${amount(rule.remaining)}`;
			} else if (typeof rule.used === "number") {
				value = `${tr("used")} ${amount(rule.used)}`;
			} else {
				value = "—";
			}
			return React.createElement(
				"div",
				null,
				React.createElement(
					"div",
					{ className: "dsh-omnigate-rule-head" },
					React.createElement("span", { className: "dsh-omnigate-label" }, label),
					React.createElement("span", { className: "dsh-omnigate-text" }, value),
				),
				ratio === undefined
					? null
					: React.createElement(
							"div",
							{ className: "dsh-omnigate-bar" },
							React.createElement("div", {
								className: "dsh-omnigate-bar-inner",
								"data-low": ratio >= 0.9 ? "true" : undefined,
								style: { width: `${Math.round(ratio * 100)}%` },
							}),
						),
				React.createElement("div", { className: "dsh-omnigate-hint" }, `${tr("resetsAt")} ${shortTime(rule.resetsAt)}`),
			);
		}

		function QuotaPanel({ data, error, stale, warning, loading, onRefresh, tr, panelRef }) {
			const wallet = data?.wallet ?? {};
			const plan = data?.plan ?? null;
			const key = data?.key ?? {};
			const limits = data?.limits ?? {};
			const currency = wallet.currency;
			const rules = Array.isArray(plan?.rules) ? plan.rules : [];

			const limitParts = [];
			if (typeof limits.rpm === "number") limitParts.push(`RPM ${amount(limits.rpm)}`);
			if (typeof limits.rpd === "number") limitParts.push(`RPD ${amount(limits.rpd)}`);

			const dailyValue = limits.dailySpend === undefined
				? limits.dailySpent === undefined ? "—" : money(limits.dailySpent, currency)
				: `${money(limits.dailySpent, currency)} / ${money(limits.dailySpend, currency)}`;
			const monthlyValue = limits.monthlySpend === undefined
				? limits.monthlySpent === undefined ? "—" : money(limits.monthlySpent, currency)
				: `${money(limits.monthlySpent, currency)} / ${money(limits.monthlySpend, currency)}`;

			const children = [];
			children.push(
				React.createElement(
					"div",
					{ className: "dsh-omnigate-header", key: "header" },
					React.createElement("span", { className: "dsh-omnigate-title" }, tr("details")),
					React.createElement("button", { type: "button", className: "dsh-omnigate-refresh", onClick: onRefresh }, tr("refresh")),
				),
			);
			if (typeof data?.user?.displayName === "string" && data.user.displayName !== "") {
				children.push(
					React.createElement("div", { className: "dsh-omnigate-hint", key: "account" }, data.user.displayName),
				);
			}

			if (loading && data === undefined) {
				children.push(React.createElement("div", { className: "dsh-omnigate-hint", key: "loading" }, tr("loading")));
			}
			if (error !== undefined) {
				children.push(React.createElement("div", { className: "dsh-omnigate-error", key: "error" }, error));
			}
			if (data !== undefined) {
				children.push(
					React.createElement(Row, { key: "wallet", label: tr("wallet"), value: money(wallet.balance, currency) }),
					React.createElement(Row, { key: "available", label: tr("available"), value: money(wallet.available, currency) }),
				);
				if (typeof wallet.reserved === "number" && wallet.reserved > 0) {
					children.push(React.createElement(Row, { key: "reserved", label: tr("reserved"), value: money(wallet.reserved, currency) }));
				}
				children.push(React.createElement("div", { className: "dsh-omnigate-sep", key: "sep-1" }));
				children.push(
					React.createElement(
						"div",
						{ className: "dsh-omnigate-rule-head", key: "plan" },
						React.createElement("span", { className: "dsh-omnigate-label" }, tr("plan")),
						React.createElement(
							"span",
							{ className: "dsh-omnigate-text" },
							plan === null || plan.name === "" ? tr("noPlan") : plan.name,
							plan !== null && plan.status !== ""
								? React.createElement("span", { className: "dsh-omnigate-chip" }, plan.status === "active" ? tr("active") : plan.status)
								: null,
						),
					),
				);
				if (rules.length === 0) {
					children.push(React.createElement("div", { className: "dsh-omnigate-hint", key: "no-rules" }, tr("noPlan")));
				} else {
					for (let index = 0; index < Math.min(rules.length, 3); index += 1) {
						children.push(React.createElement(RuleBlock, { key: `rule-${index}`, rule: rules[index], tr }));
					}
				}
				children.push(React.createElement("div", { className: "dsh-omnigate-sep", key: "sep-2" }));
				children.push(
					React.createElement(Row, {
						key: "key-limits",
						label: tr("keyLimits"),
						value: limitParts.length === 0 ? "—" : limitParts.join(" · "),
						title: limits.groupName,
					}),
					React.createElement(Row, { key: "daily", label: tr("dailySpend"), value: dailyValue }),
					React.createElement(Row, { key: "monthly", label: tr("monthlySpend"), value: monthlyValue }),
					React.createElement(Row, {
						key: "cap",
						label: tr("keySpendLimit"),
						value: key.spendLimit === undefined
							? tr("unlimited")
							: `${money(key.spent, currency)} / ${money(key.spendLimit, currency)}`,
					}),
					React.createElement(Row, {
						key: "expires",
						label: tr("keyExpires"),
						value: key.expiresAt === null || key.expiresAt === undefined ? tr("never") : shortTime(key.expiresAt),
					}),
					React.createElement("div", { className: "dsh-omnigate-sep", key: "sep-3" }),
					React.createElement(
						"div",
						{ className: "dsh-omnigate-hint", key: "updated" },
						`${tr("updatedAt")} ${clockTime(data.fetchedAt)}`,
					),
				);
			}
			if (stale && warning !== undefined) {
				children.push(
					React.createElement(
						"div",
						{ className: "dsh-omnigate-warn", key: "stale" },
						`${tr("stale")}：${warning.message ?? warning}`,
					),
				);
			}

			return React.createElement("div", { className: "dsh-omnigate-panel", ref: panelRef }, children);
		}
		//#endregion

		//#region dsh-omnigate: trigger
		function OmniGateQuotaWidget({ wide, t }) {
			const tr = makeTranslator(t);
			const status = useStatus();
			const [open, setOpen] = React.useState(false);
			const [anchor, setAnchor] = React.useState({ left: 0, bottom: 0 });
			const rootRef = React.useRef(null);
			const panelRef = React.useRef(null);

			const data = status.data;
			const loading = status.phase === "loading";
			const wallet = data?.wallet;
			const plan = data?.plan;
			const rules = Array.isArray(plan?.rules) ? plan.rules : [];
			const primary = rules.find((rule) => rule.exceeded !== true) ?? rules[0];
			const primaryRatio = ratioOf(primary);
			const low = primaryRatio !== undefined && primaryRatio >= 0.9;
			const hasError = status.phase === "error";

			React.useLayoutEffect(() => {
				if (!open) return;
				const place = () => {
					const rect = rootRef.current?.getBoundingClientRect();
					if (rect === undefined) return;
					const width = 292;
					const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
					setAnchor({ left, bottom: window.innerHeight - rect.top + 8 });
				};
				place();
				window.addEventListener("resize", place);
				return () => window.removeEventListener("resize", place);
			}, [open]);

			React.useEffect(() => {
				if (!open) return;
				const onPointer = (event) => {
					const target = event.target;
					if (rootRef.current?.contains(target) === true) return;
					if (panelRef.current?.contains(target) === true) return;
					setOpen(false);
				};
				const onKey = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("pointerdown", onPointer, true);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("pointerdown", onPointer, true);
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);

			const subtitle = (() => {
				if (hasError) return tr("error");
				if (loading && data === undefined) return tr("loading");
				const name = plan?.name !== undefined && plan.name !== "" ? plan.name : tr("noPlan");
				if (primary !== undefined && typeof primary.remaining === "number") {
					return `${name} · ${tr("planRemaining")} ${amount(primary.remaining)}`;
				}
				return name;
			})();

			const trigger = React.createElement(
				"button",
				{
					type: "button",
					className: "dsh-omnigate-trigger",
					"data-rail": wide ? undefined : "true",
					"aria-expanded": open,
					"aria-label": `${tr("title")}：${subtitle}`,
					title: `${tr("title")} · ${subtitle}`,
					onClick: () => setOpen((value) => !value),
					ref: rootRef,
				},
				React.createElement("span", { className: "dsh-omnigate-icon" }, React.createElement(GaugeIcon, { size: wide ? 18 : 20 })),
				wide
					? React.createElement(
							"span",
							{ className: "dsh-omnigate-body" },
							React.createElement(
								"span",
								{ className: "dsh-omnigate-line" },
								React.createElement("span", { className: "dsh-omnigate-name" }, tr("title")),
								React.createElement(
									"span",
									{ className: "dsh-omnigate-value" },
									data !== undefined ? money(wallet?.available, wallet?.currency) : "—",
								),
							),
							React.createElement("span", { className: "dsh-omnigate-sub" }, subtitle),
						)
					: null,
				wide
					? null
					: (low || hasError)
						? React.createElement("span", { className: "dsh-omnigate-dot", "data-error": hasError ? "true" : undefined })
						: null,
			);

			return React.createElement(
				React.Fragment,
				null,
				trigger,
				open
					? React.createElement(
							"div",
							{ style: { position: "fixed", left: anchor.left, bottom: anchor.bottom, zIndex: 1400 } },
							React.createElement(QuotaPanel, {
								data,
								error: status.phase === "error" ? status.error : undefined,
								stale: status.stale === true,
								warning: status.warning,
								loading,
								onRefresh: status.refresh,
								tr,
								panelRef,
							}),
						)
					: null,
			);
		}
		//#endregion

		//#region dsh-omnigate: setup card
		/** Find one namespace inside a `remote.settings.describe()` answer. */
		function settingsNamespace(response, nsName) {
			const view = response !== null && typeof response === "object" && response.ok === true
				? response.value
				: response;
			const list = Array.isArray(view?.namespaces)
				? view.namespaces
				: Array.isArray(view)
					? view
					: [];
			return list.find((entry) => entry?.ns === nsName);
		}

		/** Count the models in the two OmniGate routes of a provider dictionary. */
		function omnigateModelCount(providers) {
			let count = 0;
			for (const route of ["omnigate", "omnigate-claude"]) {
				const models = providers?.[route]?.models;
				if (Array.isArray(models)) count += models.length;
			}
			return count;
		}

		function OmniGateSetupBody(props) {
			const ctx = props.ctx;
			const tr = makeTranslator(props.t);
			const [keyDraft, setKeyDraft] = React.useState("");
			const [added, setAdded] = React.useState(undefined);
			const [models, setModels] = React.useState(0);
			const [status, setStatus] = React.useState({ phase: "idle" });
			const [busy, setBusy] = React.useState(false);
			const rootRef = React.useRef(null);

			// The Models page always renders its generic provider editor before
			// extension cards. OmniGate supplies the whole profile itself, so hide
			// that editor (and its Apply button) while this card is mounted; an
			// accidental empty `providers.omnigate-setup` write would be invalid.
			React.useEffect(() => {
				const anchor = rootRef.current?.parentElement;
				const container = anchor?.parentElement;
				if (!anchor || !container) return undefined;
				let hidden = null;
				let previousDisplay = "";
				const hide = () => {
					const editor = anchor.previousElementSibling;
					if (!editor || editor === anchor) return;
					if (!/editor/u.test(String(editor.className ?? ""))) return;
					if (hidden === editor) return;
					if (hidden) hidden.style.display = previousDisplay;
					hidden = editor;
					previousDisplay = editor.style.display;
					editor.style.display = "none";
				};
				hide();
				const observer = new MutationObserver(hide);
				observer.observe(container, { childList: true });
				return () => {
					observer.disconnect();
					if (hidden) hidden.style.display = previousDisplay;
				};
			}, []);

			React.useEffect(() => {
				let alive = true;
				(async () => {
					try {
						const response = await ctx.remote.settings.describe();
						if (!alive) return;
						const ns = settingsNamespace(response, "llm-pi-ai");
						const providers = ns?.value?.providers ?? {};
						setAdded(providers.omnigate !== undefined || providers["omnigate-claude"] !== undefined);
						setModels(omnigateModelCount(providers));
					} catch {
						/* leave the status unknown; the add attempt reports the real failure */
					}
				})();
				return () => {
					alive = false;
				};
			}, [ctx]);

			const keyValue = keyDraft.trim();
			const invalidKey = keyValue !== "" && !/^[\x21-\x7E]+$/u.test(keyValue);
			const buttonDisabled = busy || invalidKey || (added === true && keyValue === "");
			const submit = async () => {
				if (invalidKey) {
					setStatus({ phase: "error", message: "API Key 只能包含可见 ASCII 字符" });
					return;
				}
				setBusy(true);
				setStatus({ phase: "loading" });
				try {
					const presetResponse = await fetch("/omnigate/preset", {
						method: "GET",
						headers: { accept: "application/json" },
						cache: "no-store",
					});
					const preset = await presetResponse.json().catch(() => undefined);
					if (preset === undefined || preset.ok !== true) {
						throw new Error(preset?.error?.message ?? `预设读取失败（HTTP ${presetResponse.status}）`);
					}
					const providers = preset.providers ?? {};
					const routes = Object.keys(providers);
					if (routes.length === 0) throw new Error("预设里没有可用的模型路由");

					const described = await ctx.remote.settings.describe();
					const ns = settingsNamespace(described, "llm-pi-ai");
					if (ns === undefined) throw new Error("llm-pi-ai 设置不可用");
					const liveProviders = ns.value?.providers ?? {};
					const keyRef =
						liveProviders.omnigate?.apiKeyEnv ??
						liveProviders["omnigate-claude"]?.apiKeyEnv ??
						"OMNIGATE_API_KEY";

					if (added !== true) {
						const ops = routes.map((route) => ({
							op: "set",
							path: ["providers", route],
							value: providers[route],
						}));
						const written = await ctx.remote.settings.mutate("llm-pi-ai", ops, ns.revision);
						if (written === undefined || written.ok !== true) {
							throw new Error(written?.error?.message ?? "写入模型设置失败");
						}
					}

					if (keyValue !== "") {
						const stored = await ctx.remote.credentials.set(keyRef, keyValue);
						if (stored === undefined || stored.ok !== true) {
							throw new Error(stored?.error?.message ?? "保存 API Key 失败");
						}
					}

					setAdded(true);
					setKeyDraft("");
					setStatus({
						phase: "done",
						message: added === true ? "API Key 已更新。" : `已添加 ${routes.length} 条路由，共 ${omnigateModelCount(providers)} 个模型。关闭此卡片后即可在模型选择器中使用。`,
					});
				} catch (error) {
					setStatus({ phase: "error", message: String(error?.message ?? error) });
				} finally {
					setBusy(false);
				}
			};

			const children = [
				React.createElement("span", { className: "dsh-omnigate-setup-title", key: "title" }, "OmniGate"),
				React.createElement(
					"p",
					{ className: "dsh-omnigate-setup-text", key: "hint" },
					added === true
						? `已添加 ${models > 0 ? `${models} 个` : ""}模型：OpenAI Responses + Anthropic Messages。这里只需更新 API Key。`
						: "OpenAI Responses + Anthropic Messages。预设 15 个模型，Base URL、协议和推理等级会自动填写，只需要 API Key。",
				),
				React.createElement(
					"p",
					{ className: "dsh-omnigate-setup-text", key: "notice" },
					"无需填写页面中的其他字段；使用下面的按钮添加或更新。",
				),
				React.createElement(
					"div",
					{ className: "dsh-omnigate-setup-field", key: "key" },
					React.createElement("span", { className: "dsh-omnigate-setup-label" }, "API Key"),
					React.createElement("input", {
						className: "dsh-omnigate-setup-input",
						type: "password",
						autoComplete: "new-password",
						placeholder: "sk-...（可留空，稍后在模型设置中填写）",
						value: keyDraft,
						disabled: busy,
						onChange: (event) => setKeyDraft(event.target.value),
						"aria-label": "OmniGate API Key",
					}),
				),
				React.createElement(
					"div",
					{ className: "dsh-omnigate-setup-actions", key: "actions" },
					React.createElement(
						"button",
						{
							type: "button",
							className: "dsh-omnigate-setup-button",
							disabled: buttonDisabled,
							onClick: submit,
						},
						busy ? "处理中…" : added === true ? "更新 API Key" : "添加 OmniGate",
					),
				),
			];

			if (status.phase === "error") {
				children.push(React.createElement("p", { className: "dsh-omnigate-error", key: "error" }, status.message));
			} else if (status.phase === "done") {
				children.push(React.createElement("p", { className: "dsh-omnigate-setup-ok", key: "done" }, status.message));
			} else if (status.phase === "loading") {
				children.push(React.createElement("p", { className: "dsh-omnigate-hint", key: "loading" }, tr("loading")));
			}

			return React.createElement("div", { className: "dsh-omnigate-setup", ref: rootRef }, children);
		}

		function OmniGateSetupCard(props) {
			if (props?.provider?.provider !== "omnigate-setup") return null;
			return React.createElement(OmniGateSetupBody, props);
		}
		//#endregion

		//#region dsh-omnigate: plugin
		const inject = ["slots", "locale", "remote", "remote.settings", "remote.credentials"];

		function apply(ctx) {
			ctx.effect(
				() => ctx.locale.register(NS, { zh, en }),
				"dsh-omnigate: dictionaries",
			);
			ctx.slots.inject("sidebar.footer.action", () =>
				ctx.slots.register(
					{
						name: "sidebar.footer.action",
						id: "omnigate",
						order: -9,
						locale: NS,
					},
					OmniGateQuotaWidget,
				),
			);
			ctx.slots.inject("settings.models.provider-card", () =>
				ctx.slots.register(
					{
						name: "settings.models.provider-card",
						id: "omnigate-setup",
						order: -10,
						locale: NS,
						key: "llm-pi-ai",
					},
					(props) => React.createElement(OmniGateSetupCard, { ...props, ctx }),
				),
			);
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
