"use client";
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";

const currencies = ["EUR", "USD", "SEK", "GBP"];

const chartColors = {
  productCost: "#f59e0b",
  adSpend: "#1877F2",
  fees: "#8b5cf6",
  profit: "#22c55e",
};

const inputClass =
  "h-9 w-full bg-slate-900 border border-white/10 rounded-xl px-3 text-sm text-white outline-none focus:border-emerald-400/50 transition-colors placeholder-slate-600";

function parseNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(/,/g, ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number): string {
  return (value * 100).toFixed(1) + "%";
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
    >
      <span
        className="relative w-8 h-4 rounded-full transition-colors"
        style={{
          backgroundColor: checked
            ? "rgb(16 185 129 / 0.3)"
            : "rgb(255 255 255 / 0.1)",
        }}
      >
        <span
          className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
          style={{
            left: checked ? "18px" : "2px",
            backgroundColor: checked
              ? "rgb(52 211 153)"
              : "rgb(100 116 139)",
          }}
        />
      </span>
      {label}
    </button>
  );
}

export default function ProfitEstimator() {
  const [sales, setSales] = useState("");
  const [adSpend, setAdSpend] = useState("");
  const [roas, setRoas] = useState("");
  const [breakevenRoas, setBreakevenRoas] = useState("");
  const [feeEnabled, setFeeEnabled] = useState(false);
  const [feeRate, setFeeRate] = useState("5");
  const [currency, setCurrency] = useState("EUR");
  const [roasMode, setRoasMode] = useState<"fix-sales" | "fix-adspend">(
    "fix-sales"
  );
  const [showFormula, setShowFormula] = useState(false);
  const [activeSlice, setActiveSlice] = useState<number | undefined>(undefined);

  const pSales = parseNumber(sales);
  const pAdSpend = parseNumber(adSpend);
  const pRoas = parseNumber(roas);
  const pBreakevenRoas = parseNumber(breakevenRoas);
  const pFeeRate = parseNumber(feeRate) ?? 5;

  const resolved = useMemo(() => {
    if (!pBreakevenRoas || pBreakevenRoas <= 0) return null;

    let rSales = pSales;
    let rAdSpend = pAdSpend;
    let rRoas = pRoas;

    if (rSales && rAdSpend && (!rRoas || rRoas <= 0)) {
      rRoas = rSales / rAdSpend;
    } else if (rSales && rRoas && (!rAdSpend || rAdSpend <= 0)) {
      rAdSpend = rSales / rRoas;
    } else if (rAdSpend && rRoas && (!rSales || rSales <= 0)) {
      rSales = rAdSpend * rRoas;
    }

    if (pRoas && rSales && rAdSpend) {
      if (roasMode === "fix-sales") {
        rAdSpend = rSales / pRoas;
      } else {
        rSales = rAdSpend * pRoas;
      }
      rRoas = pRoas;
    }

    if (
      !rSales ||
      rSales <= 0 ||
      rAdSpend === null ||
      rAdSpend < 0 ||
      !rRoas ||
      rRoas <= 0
    ) {
      return null;
    }

    const feeRateFraction = feeEnabled ? Math.max(pFeeRate, 0) / 100 : 0;
    const afterProductCost = rSales / pBreakevenRoas;
    const estimatedProductCost = rSales - afterProductCost;
    const fees = rSales * feeRateFraction;
    const profit = afterProductCost - rAdSpend - fees;
    const margin = profit / rSales;
    const cogRatio = estimatedProductCost / rSales;

    const chartData = [
      {
        name: "Product Cost",
        value: Math.max(estimatedProductCost, 0),
        color: chartColors.productCost,
      },
      {
        name: "Ad Spend",
        value: Math.max(rAdSpend, 0),
        color: chartColors.adSpend,
      },
      ...(fees > 0
        ? [{ name: "Transaction Fees", value: fees, color: chartColors.fees }]
        : []),
      {
        name: "Profit",
        value: Math.max(profit, 0),
        color: chartColors.profit,
      },
    ].filter((item) => item.value > 0);

    return {
      sales: rSales,
      adSpend: rAdSpend,
      roas: rRoas,
      afterProductCost,
      estimatedProductCost,
      fees,
      profit,
      margin,
      cogRatio,
      chartData,
    };
  }, [pSales, pAdSpend, pRoas, pBreakevenRoas, pFeeRate, feeEnabled, roasMode]);

  const filledCount = [pSales, pAdSpend, pRoas].filter(
    (v) => v !== null && v > 0
  ).length;
  const isValid = Boolean(resolved) && filledCount >= 2;

  const salesIsAuto = pSales === null && Boolean(resolved?.sales);
  const adSpendIsAuto = pAdSpend === null && Boolean(resolved?.adSpend);
  const roasIsAuto = pRoas === null && Boolean(resolved?.roas);

  const hasAnyInput =
    pSales !== null ||
    pAdSpend !== null ||
    pRoas !== null ||
    pBreakevenRoas !== null;

  const resetAll = () => {
    setSales("");
    setAdSpend("");
    setRoas("");
    setBreakevenRoas("");
    // fee state intentionally preserved
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex rounded-full bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 text-xs font-medium text-emerald-300 tracking-wide uppercase">
            EM Academy Tools
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Profit Estimator
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Estimate profit without knowing your exact product cost - enter any two of Sales, Ad Spend, or ROAS.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">

          {/* Inputs */}
          <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-2xl p-6 space-y-5">
            <div>
              <div className="w-7 h-0.5 bg-emerald-400 rounded-full mb-2" />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                Your Numbers
              </h2>
            </div>

            <div className="rounded-2xl bg-emerald-400/[0.06] border border-emerald-400/20 px-4 py-3 text-xs text-slate-300 leading-relaxed">
              Fill in <span className="text-emerald-400 font-medium">Breakeven ROAS</span> plus <span className="text-emerald-400 font-medium">any two</span> of Sales, Ad Spend, or ROAS - the third calculates automatically.
            </div>

            {/* Main four inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Sales</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="50 000"
                  value={
                    salesIsAuto && resolved
                      ? String(Math.round(resolved.sales))
                      : sales
                  }
                  onChange={(e) => setSales(e.target.value)}
                />
                {salesIsAuto && (
                  <p className="text-xs text-emerald-400 h-3">Auto-calculated</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Ad Spend</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="25 000"
                  value={
                    adSpendIsAuto && resolved
                      ? String(Math.round(resolved.adSpend))
                      : adSpend
                  }
                  onChange={(e) => setAdSpend(e.target.value)}
                />
                {adSpendIsAuto && (
                  <p className="text-xs text-emerald-400">Auto-calculated</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">
                  Breakeven ROAS <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="1.2"
                  value={breakevenRoas}
                  onChange={(e) => setBreakevenRoas(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">ROAS</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="1.8"
                  value={
                    roasIsAuto && resolved
                      ? resolved.roas.toFixed(2)
                      : roas
                  }
                  onChange={(e) => setRoas(e.target.value)}
                />
                {roasIsAuto && (
                  <p className="text-xs text-emerald-400">Auto-calculated</p>
                )}
              </div>
            </div>

            {/* ROAS conflict resolver - only shown when all 3 are filled */}
            {filledCount === 3 && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-3 space-y-2">
                <p className="text-xs text-slate-400">
                  All three entered - which value should adjust?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRoasMode("fix-sales")}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors border ${
                      roasMode === "fix-sales"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    Adjust Ad Spend
                  </button>
                  <button
                    onClick={() => setRoasMode("fix-adspend")}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors border ${
                      roasMode === "fix-adspend"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    Adjust Sales
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  {roasMode === "fix-sales"
                    ? "Sales stay fixed - ad spend recalculates from ROAS"
                    : "Ad spend stays fixed - sales recalculates from ROAS"}
                </p>
              </div>
            )}

            {/* Fee toggle */}
            <div className="flex items-center gap-3">
              <Toggle
                checked={feeEnabled}
                onChange={() => setFeeEnabled(!feeEnabled)}
                label="Transaction fee"
              />
              {feeEnabled && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={20}
                    step={0.1}
                    value={feeRate}
                    onChange={(e) => setFeeRate(e.target.value)}
                    className="w-14 h-7 bg-slate-900 border border-white/10 rounded-lg px-2 text-xs text-white text-center outline-none focus:border-emerald-400/50 transition-colors"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Currency</p>
              <div className="flex gap-2">
                {currencies.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                      currency === c
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation hint */}
            {!isValid && hasAnyInput && (
              <p className="text-xs text-amber-400">
                Enter Breakeven ROAS and at least two of: Sales, Ad Spend, ROAS.
              </p>
            )}

            {/* Reset + How it works */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={resetAll}
                className="bg-white/10 hover:bg-white/[0.15] text-slate-300 rounded-xl px-5 py-2 text-sm font-medium transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showFormula ? "Hide formula" : "How it works"}
              </button>
            </div>

            {/* Collapsible formula */}
            {showFormula && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-2 text-xs text-slate-400 leading-relaxed">
                <p>Enter any two of Sales, Ad Spend, ROAS - the third calculates automatically.</p>
                <p>After product cost = Sales / Breakeven ROAS</p>
                <p>Estimated profit = After product cost - Ad spend - Transaction fee</p>
                <p className="text-slate-600 pt-1">
                  Works well as long as your breakeven ROAS accurately reflects your product mix for the period.
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-5">
            {isValid && resolved ? (
              <>
                {/* Stat cards */}
                <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-2xl p-6">
                  <div>
                    <div className="w-7 h-0.5 bg-emerald-400 rounded-full mb-2" />
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                      Results
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4">
                      <p className="text-xs text-slate-500 mb-1">Estimated Profit</p>
                      <p
                        className={`text-xl font-bold ${
                          resolved.profit >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatCurrency(resolved.profit, currency)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4">
                      <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
                      <p
                        className={`text-xl font-bold ${
                          resolved.margin >= 0.1
                            ? "text-emerald-400"
                            : resolved.margin >= 0
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatPct(resolved.margin)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4">
                      <p className="text-xs text-slate-500 mb-1">After Product Cost</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(resolved.afterProductCost, currency)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">covers ads + profit</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4">
                      <p className="text-xs text-slate-500 mb-1">Est. Product Cost</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(resolved.estimatedProductCost, currency)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{formatPct(resolved.cogRatio)} of sales</p>
                    </div>
                    {resolved.fees > 0 && (
                      <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 col-span-2">
                        <p className="text-xs text-slate-500 mb-1">
                          Transaction Fees
                        </p>
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(resolved.fees, currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pie chart */}
                <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-2xl p-6">
                  <div>
                    <div className="w-7 h-0.5 bg-emerald-400 rounded-full mb-2" />
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                      Sales Breakdown
                    </h2>
                  </div>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resolved.chartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth={2}
                          activeIndex={activeSlice}
                          activeShape={(props: any) => {
                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                            return (
                              <g style={{ transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)", transformOrigin: `${cx}px ${cy}px`, transform: "scale(1.07)" }}>
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={innerRadius}
                                  outerRadius={outerRadius}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                  stroke="rgba(255,255,255,0.15)"
                                  strokeWidth={2}
                                />
                              </g>
                            );
                          }}
                          onMouseEnter={(_, index) => setActiveSlice(index)}
                          onMouseLeave={() => setActiveSlice(undefined)}
                        >
                          {resolved.chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 12,
                            padding: "8px 12px",
                          }}
                          itemStyle={{ color: "#e2e8f0", fontSize: 13 }}
                          labelStyle={{ color: "#94a3b8", fontSize: 12 }}
                          formatter={(value: number, name: string) => [
                            formatCurrency(Number(value), currency),
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {resolved.chartData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs text-slate-400">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-white">
                            {formatCurrency(item.value, currency)}
                          </span>
                          <span className="text-xs text-slate-600 ml-2">
                            {formatPct(item.value / resolved.sales)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-2xl p-6 space-y-2">
                  <div>
                    <div className="w-7 h-0.5 bg-emerald-400 rounded-full mb-2" />
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                      Keep in Mind
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This is an estimate. It works well as long as your breakeven ROAS accurately reflects your product mix for the period you are analyzing.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    If product mix, shipping, VAT, discounts, or upsells change, real profit can differ from the estimate.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-white/[0.06] border border-white/10 shadow-2xl p-6 flex items-center justify-center min-h-[200px]">
                <p className="text-slate-500 text-sm text-center leading-relaxed">
                  Fill in Breakeven ROAS and any two of<br />Sales, Ad Spend, ROAS to see results.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
