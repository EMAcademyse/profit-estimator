"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Percent,
  Coins,
  Receipt,
  TrendingUp,
  Info,
  PieChart as PieChartIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const translations = {
  sv: {
    title: "Profit Estimator",
    subtitle:
      "Räkna ut estimerad vinst i valuta och procent, även när du inte vet exakt produktkostnad.",
    sales: "Försäljning",
    adSpend: "Annonskostnad",
    roas: "ROAS",
    breakevenRoas: "Breakeven ROAS",
    transactionFeeToggle: "Lägg till transaktionsavgift",
    transactionFeeRate: "Transaktionsavgift %",
    currency: "Valuta",
    results: "Resultat",
    visualBreakdown: "Visuell fördelning av försäljningen",
    chartSubtitle:
      "Se hur stor del av försäljningen som går till produktkostnad, annonser, avgifter och vinst.",
    chartProductCost: "Produktkostnad",
    chartAdSpend: "Annonskostnad",
    chartFees: "Avgifter",
    chartProfit: "Vinst",
    estimatedProfit: "Estimerad vinst",
    profitMargin: "Vinstmarginal",
    afterProductCost: "Kvar efter produktkostnad",
    estimatedProductCost: "Estimerad produktkostnad",
    transactionFees: "Transaktionsavgifter",
    costRatio: "Produktkostnad i %",
    formulaTitle: "Hur kalkylatorn räknar",
    formula1:
      "Du behöver fylla i två av dessa tre: Försäljning, Annonskostnad, ROAS.",
    formula2: "Saknas en av dem räknas den ut automatiskt.",
    formula3: "Kvar efter produktkostnad = Försäljning / Breakeven ROAS",
    formula4:
      "Estimerad vinst = Kvar efter produktkostnad - Annonskostnad - Transaktionsavgift",
    notesTitle: "Viktigt att tänka på",
    note1:
      "Detta är en uppskattning. Den blir bra så länge din breakeven ROAS är korrekt för perioden du analyserar.",
    note2:
      "Om produktmix, frakt, moms, rabatter eller upsells ändras kan verklig vinst skilja sig från estimatet.",
    clear: "Reset",
    invalid:
      "Fyll i breakeven ROAS och minst två av följande: försäljning, annonskostnad, ROAS.",
    autoCalculated: "Beräknas automatiskt",
    enterAnyTwo: "Fyll i valfria två",
  },
  en: {
    title: "Profit Estimator",
    subtitle:
      "Estimate profit in currency and percent, even when you do not know the exact product cost.",
    sales: "Sales",
    adSpend: "Ad Spend",
    roas: "ROAS",
    breakevenRoas: "Breakeven ROAS",
    transactionFeeToggle: "Add transaction fee",
    transactionFeeRate: "Transaction fee %",
    currency: "Currency",
    results: "Results",
    visualBreakdown: "Visual breakdown of sales",
    chartSubtitle:
      "See how much of your sales goes to product cost, ads, fees, and profit.",
    chartProductCost: "Product Cost",
    chartAdSpend: "Ad Spend",
    chartFees: "Fees",
    chartProfit: "Profit",
    estimatedProfit: "Estimated Profit",
    profitMargin: "Profit Margin",
    afterProductCost: "Remaining After Product Cost",
    estimatedProductCost: "Estimated Product Cost",
    transactionFees: "Transaction Fees",
    costRatio: "Product Cost %",
    formulaTitle: "How the calculator works",
    formula1:
      "You need to enter any two of these three: Sales, Ad Spend, ROAS.",
    formula2: "The missing one is calculated automatically.",
    formula3: "Remaining after product cost = Sales / Breakeven ROAS",
    formula4:
      "Estimated profit = Remaining after product cost - Ad spend - Transaction fee",
    notesTitle: "Important to remember",
    note1:
      "This is an estimate. It works well as long as your breakeven ROAS is accurate for the period you are analyzing.",
    note2:
      "If product mix, shipping, VAT, discounts, or upsells change, real profit can differ from the estimate.",
    clear: "Reset",
    invalid:
      "Enter breakeven ROAS and at least two of the following: sales, ad spend, ROAS.",
    autoCalculated: "Auto-calculated",
    enterAnyTwo: "Enter any two",
  },
  de: {
    title: "Profit Estimator",
    subtitle:
      "Berechne den geschätzten Gewinn in Währung und Prozent, auch wenn du die genauen Produktkosten nicht kennst.",
    sales: "Umsatz",
    adSpend: "Werbekosten",
    roas: "ROAS",
    breakevenRoas: "Break-even-ROAS",
    transactionFeeToggle: "Transaktionsgebühr hinzufügen",
    transactionFeeRate: "Transaktionsgebühr %",
    currency: "Währung",
    results: "Ergebnisse",
    visualBreakdown: "Visuelle Aufteilung des Umsatzes",
    chartSubtitle:
      "Sieh, wie viel deines Umsatzes auf Produktkosten, Werbung, Gebühren und Gewinn entfällt.",
    chartProductCost: "Produktkosten",
    chartAdSpend: "Werbekosten",
    chartFees: "Gebühren",
    chartProfit: "Gewinn",
    estimatedProfit: "Geschätzter Gewinn",
    profitMargin: "Gewinnmarge",
    afterProductCost: "Verbleibend nach Produktkosten",
    estimatedProductCost: "Geschätzte Produktkosten",
    transactionFees: "Transaktionsgebühren",
    costRatio: "Produktkosten in %",
    formulaTitle: "So funktioniert der Rechner",
    formula1: "Gib zwei von diesen drei Werten ein: Umsatz, Werbekosten, ROAS.",
    formula2: "Der fehlende Wert wird automatisch berechnet.",
    formula3: "Verbleibend nach Produktkosten = Umsatz / Break-even-ROAS",
    formula4:
      "Geschätzter Gewinn = Verbleibend nach Produktkosten - Werbekosten - Transaktionsgebühr",
    notesTitle: "Wichtig zu beachten",
    note1:
      "Das ist eine Schätzung. Sie ist gut nutzbar, solange deine Break-even-ROAS für den analysierten Zeitraum korrekt ist.",
    note2:
      "Wenn sich Produktmix, Versand, MwSt., Rabatte oder Upsells ändern, kann der echte Gewinn vom Schätzwert abweichen.",
    clear: "Reset",
    invalid:
      "Bitte Break-even-ROAS und mindestens zwei von folgenden Werten eingeben: Umsatz, Werbekosten, ROAS.",
    autoCalculated: "Automatisch berechnet",
    enterAnyTwo: "Beliebige zwei eingeben",
  },
  fr: {
    title: "Profit Estimator",
    subtitle:
      "Estimez votre profit en devise et en pourcentage, même si vous ne connaissez pas le coût exact du produit.",
    sales: "Ventes",
    adSpend: "Dépenses publicitaires",
    roas: "ROAS",
    breakevenRoas: "ROAS de rentabilité",
    transactionFeeToggle: "Ajouter des frais de transaction",
    transactionFeeRate: "Frais de transaction %",
    currency: "Devise",
    results: "Résultats",
    visualBreakdown: "Répartition visuelle des ventes",
    chartSubtitle:
      "Voyez quelle part de vos ventes va au coût produit, aux publicités, aux frais et au profit.",
    chartProductCost: "Coût produit",
    chartAdSpend: "Dépenses pub",
    chartFees: "Frais",
    chartProfit: "Profit",
    estimatedProfit: "Profit estimé",
    profitMargin: "Marge bénéficiaire",
    afterProductCost: "Reste après coût produit",
    estimatedProductCost: "Coût produit estimé",
    transactionFees: "Frais de transaction",
    costRatio: "Coût produit en %",
    formulaTitle: "Comment le calculateur fonctionne",
    formula1:
      "Saisissez deux de ces trois valeurs : Ventes, Dépenses publicitaires, ROAS.",
    formula2: "La valeur manquante est calculée automatiquement.",
    formula3: "Reste après coût produit = Ventes / ROAS de rentabilité",
    formula4:
      "Profit estimé = Reste après coût produit - Dépenses publicitaires - Frais de transaction",
    notesTitle: "À garder en tête",
    note1:
      "Ceci est une estimation. Elle fonctionne bien tant que votre ROAS de rentabilité est correct pour la période analysée.",
    note2:
      "Si le mix produit, la livraison, la TVA, les remises ou les upsells changent, le profit réel peut différer de l'estimation.",
    clear: "Reset",
    invalid:
      "Saisissez le ROAS de rentabilité et au moins deux des éléments suivants : ventes, dépenses publicitaires, ROAS.",
    autoCalculated: "Calculé automatiquement",
    enterAnyTwo: "Saisissez deux valeurs",
  },
  es: {
    title: "Profit Estimator",
    subtitle:
      "Calcula el beneficio estimado en moneda y porcentaje, incluso si no conoces el coste exacto del producto.",
    sales: "Ventas",
    adSpend: "Gasto publicitario",
    roas: "ROAS",
    breakevenRoas: "ROAS de equilibrio",
    transactionFeeToggle: "Añadir comisión por transacción",
    transactionFeeRate: "Comisión por transacción %",
    currency: "Moneda",
    results: "Resultados",
    visualBreakdown: "Desglose visual de las ventas",
    chartSubtitle:
      "Mira qué parte de tus ventas va al coste del producto, anuncios, comisiones y beneficio.",
    chartProductCost: "Coste del producto",
    chartAdSpend: "Gasto publicitario",
    chartFees: "Comisiones",
    chartProfit: "Beneficio",
    estimatedProfit: "Beneficio estimado",
    profitMargin: "Margen de beneficio",
    afterProductCost: "Restante después del coste del producto",
    estimatedProductCost: "Coste estimado del producto",
    transactionFees: "Comisiones por transacción",
    costRatio: "Coste del producto en %",
    formulaTitle: "Cómo funciona la calculadora",
    formula1:
      "Introduce dos de estos tres valores: Ventas, Gasto publicitario, ROAS.",
    formula2: "El valor que falta se calcula automáticamente.",
    formula3:
      "Restante después del coste del producto = Ventas / ROAS de equilibrio",
    formula4:
      "Beneficio estimado = Restante después del coste del producto - Gasto publicitario - Comisión por transacción",
    notesTitle: "Importante tener en cuenta",
    note1:
      "Esto es una estimación. Funciona bien siempre que tu ROAS de equilibrio sea correcto para el periodo analizado.",
    note2:
      "Si cambian la mezcla de productos, el envío, el IVA, los descuentos o los upsells, el beneficio real puede diferir de la estimación.",
    clear: "Reset",
    invalid:
      "Introduce el ROAS de equilibrio y al menos dos de los siguientes: ventas, gasto publicitario, ROAS.",
    autoCalculated: "Calculado automáticamente",
    enterAnyTwo: "Introduce dos valores",
  },
} as const;

type Lang = keyof typeof translations;

type ChartItem = {
  name: string;
  value: number;
  color: string;
};

const currencies = ["EUR", "USD", "SEK", "GBP"];

const chartColorMap = {
  productCost: "#f59e0b",
  adSpend: "#1877F2",
  fees: "#8b5cf6",
  profit: "#22c55e",
};

function normalizeNumberInput(value: string) {
  return value.replace(/\s/g, "").replace(/,/g, ".");
}

function parseNumber(value: string) {
  const normalized = normalizeNumberInput(value);
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumberForInput(value: number) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(4))).replace(/\.0+$/, "");
}

function getLocale(lang: Lang) {
  const localeMap: Record<Lang, string> = {
    sv: "sv-SE",
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
  };

  return localeMap[lang];
}

function formatCurrency(value: number, currency: string, lang: Lang) {
  return new Intl.NumberFormat(getLocale(lang), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number, lang: Lang) {
  return new Intl.NumberFormat(getLocale(lang), {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProfitEstimatorCalculator() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  const [sales, setSales] = useState("51313");
  const [adSpend, setAdSpend] = useState("29932");
  const [roas, setRoas] = useState("");
  const [breakevenRoas, setBreakevenRoas] = useState("1,2");
  const [transactionFeeEnabled, setTransactionFeeEnabled] = useState(true);
  const [transactionFeeRate, setTransactionFeeRate] = useState("5");
  const [currency, setCurrency] = useState("EUR");
  const [roasMode, setRoasMode] = useState<"efficiency" | "scaling">(
    "efficiency",
  );

  const parsedSales = parseNumber(sales);
  const parsedAdSpend = parseNumber(adSpend);
  const parsedRoas = parseNumber(roas);
  const parsedBreakevenRoas = parseNumber(breakevenRoas);
  const parsedTransactionFeeRate = parseNumber(transactionFeeRate);

  const fieldCount = [parsedSales, parsedAdSpend, parsedRoas].filter(
    (value) => value !== null && value > 0,
  ).length;

  const resolved = useMemo(() => {
    if (!parsedBreakevenRoas || parsedBreakevenRoas <= 0) {
      return null;
    }

    let resolvedSales = parsedSales;
    let resolvedAdSpend = parsedAdSpend;
    let resolvedRoas = parsedRoas;

    if (
      resolvedSales &&
      resolvedAdSpend &&
      (!resolvedRoas || resolvedRoas <= 0)
    ) {
      resolvedRoas = resolvedSales / resolvedAdSpend;
    } else if (
      resolvedSales &&
      resolvedRoas &&
      (!resolvedAdSpend || resolvedAdSpend <= 0)
    ) {
      resolvedAdSpend = resolvedSales / resolvedRoas;
    } else if (
      resolvedAdSpend &&
      resolvedRoas &&
      (!resolvedSales || resolvedSales <= 0)
    ) {
      resolvedSales = resolvedAdSpend * resolvedRoas;
    }

    if (parsedRoas && resolvedSales && resolvedAdSpend) {
      if (roasMode === "efficiency") {
        resolvedAdSpend = resolvedSales / parsedRoas;
      } else {
        resolvedSales = resolvedAdSpend * parsedRoas;
      }
      resolvedRoas = parsedRoas;
    }

    if (
      !resolvedSales ||
      resolvedSales <= 0 ||
      resolvedAdSpend === null ||
      resolvedAdSpend < 0 ||
      !resolvedRoas ||
      resolvedRoas <= 0
    ) {
      return null;
    }

    const safeTransactionFeeRate = transactionFeeEnabled
      ? Math.max(parsedTransactionFeeRate ?? 0, 0) / 100
      : 0;

    const remainingAfterProductCost = resolvedSales / parsedBreakevenRoas;
    const estimatedProductCost = resolvedSales - remainingAfterProductCost;
    const transactionFees = resolvedSales * safeTransactionFeeRate;
    const estimatedProfit =
      remainingAfterProductCost - resolvedAdSpend - transactionFees;
    const profitMargin = estimatedProfit / resolvedSales;
    const productCostRatio = estimatedProductCost / resolvedSales;

    const chartData: ChartItem[] = [
      {
        name: t.chartProductCost,
        value: Math.max(estimatedProductCost, 0),
        color: chartColorMap.productCost,
      },
      {
        name: t.chartAdSpend,
        value: Math.max(resolvedAdSpend, 0),
        color: chartColorMap.adSpend,
      },
      {
        name: t.chartFees,
        value: Math.max(transactionFees, 0),
        color: chartColorMap.fees,
      },
      {
        name: t.chartProfit,
        value: Math.max(estimatedProfit, 0),
        color: chartColorMap.profit,
      },
    ].filter((item) => item.value > 0);

    return {
      sales: resolvedSales,
      adSpend: resolvedAdSpend,
      roas: resolvedRoas,
      remainingAfterProductCost,
      estimatedProductCost,
      transactionFees,
      estimatedProfit,
      profitMargin,
      productCostRatio,
      chartData,
    };
  }, [
    parsedSales,
    parsedAdSpend,
    parsedRoas,
    parsedBreakevenRoas,
    parsedTransactionFeeRate,
    transactionFeeEnabled,
    roasMode,
    t.chartProductCost,
    t.chartAdSpend,
    t.chartFees,
    t.chartProfit,
  ]);

  const isValid = Boolean(resolved) && fieldCount >= 2;

  const salesIsAuto = parsedSales === null && Boolean(resolved?.sales);
  const adSpendIsAuto = parsedAdSpend === null && Boolean(resolved?.adSpend);
  const roasIsAuto = parsedRoas === null && Boolean(resolved?.roas);

  const clearAll = () => {
    setSales("");
    setAdSpend("");
    setRoas("");
    setBreakevenRoas("");
    setTransactionFeeEnabled(false);
    setTransactionFeeRate("5");
    setCurrency("EUR");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
              {t.subtitle}
            </p>
          </div>

          <Tabs value={lang} onValueChange={(value) => setLang(value as Lang)}>
            <TabsList className="grid w-full grid-cols-5 md:w-[420px]">
              <TabsTrigger value="en">EN</TabsTrigger>
              <TabsTrigger value="sv">SV</TabsTrigger>
              <TabsTrigger value="de">DE</TabsTrigger>
              <TabsTrigger value="fr">FR</TabsTrigger>
              <TabsTrigger value="es">ES</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calculator className="h-5 w-5" />
                {t.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label={t.sales}
                  value={
                    salesIsAuto && resolved
                      ? formatNumberForInput(resolved.sales)
                      : sales
                  }
                  onChange={setSales}
                  placeholder="50000"
                  helper={salesIsAuto ? t.autoCalculated : t.enterAnyTwo}
                />

                <InputField
                  label={t.adSpend}
                  value={
                    adSpendIsAuto && resolved
                      ? formatNumberForInput(resolved.adSpend)
                      : adSpend
                  }
                  onChange={setAdSpend}
                  placeholder="25000"
                  helper={adSpendIsAuto ? t.autoCalculated : t.enterAnyTwo}
                />

                <InputField
                  label={t.roas}
                  value={
                    roasIsAuto && resolved
                      ? formatNumberForInput(resolved.roas)
                      : roas
                  }
                  onChange={setRoas}
                  placeholder="1,8"
                  helper={roasIsAuto ? t.autoCalculated : t.enterAnyTwo}
                />

                <InputField
                  label={t.breakevenRoas}
                  value={breakevenRoas}
                  onChange={setBreakevenRoas}
                  placeholder="1,2"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                <Label className="text-sm font-medium">ROAS Behavior</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={roasMode === "efficiency" ? "default" : "outline"}
                    onClick={() => setRoasMode("efficiency")}
                    className="rounded-2xl"
                  >
                    Efficiency Mode
                  </Button>
                  <Button
                    type="button"
                    variant={roasMode === "scaling" ? "default" : "outline"}
                    onClick={() => setRoasMode("scaling")}
                    className="rounded-2xl"
                  >
                    Scaling Mode
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  {roasMode === "efficiency"
                    ? "Changing ROAS adjusts ad spend (sales fixed)"
                    : "Changing ROAS adjusts sales (ad spend fixed)"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm font-medium leading-snug">
                      {t.transactionFeeToggle}
                    </Label>
                    <Switch
                      checked={transactionFeeEnabled}
                      onCheckedChange={setTransactionFeeEnabled}
                    />
                  </div>

                  {transactionFeeEnabled ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">
                        {t.transactionFeeRate}
                      </Label>
                      <Input
                        inputMode="decimal"
                        value={transactionFeeRate}
                        onChange={(e) => setTransactionFeeRate(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>{t.currency}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {currencies.map((item) => (
                      <Button
                        key={item}
                        type="button"
                        variant={currency === item ? "default" : "outline"}
                        className="rounded-2xl"
                        onClick={() => setCurrency(item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {" "}
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="rounded-2xl"
                >
                  {t.clear}
                </Button>
              </div>

              {!isValid ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  {t.invalid}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{t.results}</CardTitle>
              </CardHeader>
              <CardContent>
                {resolved && isValid ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ResultCard
                      icon={<Coins className="h-5 w-5" />}
                      label={t.estimatedProfit}
                      value={formatCurrency(
                        resolved.estimatedProfit,
                        currency,
                        lang,
                      )}
                    />
                    <ResultCard
                      icon={<Percent className="h-5 w-5" />}
                      label={t.profitMargin}
                      value={formatPercent(resolved.profitMargin, lang)}
                    />
                    <ResultCard
                      icon={<TrendingUp className="h-5 w-5" />}
                      label={t.afterProductCost}
                      value={formatCurrency(
                        resolved.remainingAfterProductCost,
                        currency,
                        lang,
                      )}
                    />
                    <ResultCard
                      icon={<Receipt className="h-5 w-5" />}
                      label={t.estimatedProductCost}
                      value={formatCurrency(
                        resolved.estimatedProductCost,
                        currency,
                        lang,
                      )}
                    />
                    <ResultCard
                      icon={<Receipt className="h-5 w-5" />}
                      label={t.transactionFees}
                      value={formatCurrency(
                        resolved.transactionFees,
                        currency,
                        lang,
                      )}
                    />
                    <ResultCard
                      icon={<Percent className="h-5 w-5" />}
                      label={t.costRatio}
                      value={formatPercent(resolved.productCostRatio, lang)}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {resolved && isValid ? (
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PieChartIcon className="h-5 w-5" />
                    {t.visualBreakdown}
                  </CardTitle>
                  <p className="text-sm text-slate-600">{t.chartSubtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {resolved.chartData.map((item) => (
                      <div
                        key={item.name}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={resolved.chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={3}
                          >
                            {resolved.chartData.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={entry.color}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: 16,
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                            }}
                            formatter={(value: number | string) =>
                              formatCurrency(Number(value), currency, lang)
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {resolved.chartData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatPercent(
                                  item.value / resolved.sales,
                                  lang,
                                )}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(item.value, currency, lang)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {resolved && isValid ? (
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                      <div className="space-y-2 text-sm text-slate-700">
                        <p className="font-medium">{t.formulaTitle}</p>
                        <p>{t.formula1}</p>
                        <p>{t.formula2}</p>
                        <p>{t.formula3}</p>
                        <p>{t.formula4}</p>
                        {transactionFeeEnabled ? (
                          <p className="text-xs text-slate-500">
                            {t.transactionFeeRate}: {transactionFeeRate || "0"}%
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{t.notesTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p>{t.note1}</p>
                <p>{t.note2}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  helper?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ResultCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-slate-500">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
