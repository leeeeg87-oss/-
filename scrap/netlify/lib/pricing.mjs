// منطق التحويل والحساب (بدون اتصال بالإنترنت، سهل الاختبار)

// أسعار LME تأتي بالدولار لكل طن. أي رقم خارج هذا النطاق نعتبره خطأ من المصدر.
const MIN_USD_PER_TON = 100;
const MAX_USD_PER_TON = 200000;

export function requiredSources(config) {
  return [...new Set(config.categories.map(c => c.source).filter(s => s !== "manual"))];
}

export function validateRates(rates, config) {
  if (!rates || typeof rates !== "object") throw new Error("رد المصدر لا يحتوي أسعاراً");
  for (const key of requiredSources(config)) {
    const v = rates[key];
    if (typeof v !== "number" || !(v > MIN_USD_PER_TON && v < MAX_USD_PER_TON)) {
      throw new Error(`سعر غير منطقي أو ناقص: ${key} = ${v}`);
    }
  }
}

// rates: { lme_copper: دولار/طن, ... }  ->  قائمة أنواع بالريال لكل كيلو ولكل طن
export function buildItems(rates, config) {
  return config.categories.map(c => {
    let sarPerKg;
    if (c.source === "manual") {
      sarPerKg = c.manualSarPerKg;
    } else {
      const sarPerTonWorld = rates[c.source] * config.usdToSar; // ريال/طن عالمي
      sarPerKg = (sarPerTonWorld * c.percent / 100) / 1000;
    }
    return {
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      manual: c.source === "manual",
      note: c.manualNote || "",
      sarPerKg,
      sarPerTon: sarPerKg * 1000
    };
  });
}
