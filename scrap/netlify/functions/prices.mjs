import { getStore } from "@netlify/blobs";
import settings from "../../config.json";
import { validateRates, buildItems } from "../lib/pricing.mjs";

const API_URL = "https://api.metals.dev/v1/metal/authority";
const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });

async function fetchFresh(apiKey) {
  const url = `${API_URL}?api_key=${encodeURIComponent(apiKey)}&authority=lme&currency=USD&unit=mt`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`المصدر رد بالحالة ${res.status}`);
  const data = await res.json();
  if (data.status && data.status !== "success") throw new Error(`المصدر رد: ${data.status}`);
  validateRates(data.rates, settings);
  return {
    rates: data.rates,
    priceTime: data.timestamp || new Date().toISOString(),
    checkedAt: Date.now()
  };
}

export default async () => {
  const apiKey = Netlify.env.get("METALS_DEV_API_KEY");
  const ttl = settings.cacheMinutes * 60 * 1000;
  const store = getStore("scrap-cache");

  let cached = null;
  try { cached = await store.get("lme", { type: "json" }); } catch { /* لا يوجد كاش */ }

  if (!cached || Date.now() - cached.checkedAt > ttl) {
    try {
      if (!apiKey) throw new Error("METALS_DEV_API_KEY غير موجود في Environment variables");
      cached = await fetchFresh(apiKey);
      await store.setJSON("lme", cached);
    } catch (e) {
      const msg = String(e.message).replaceAll(apiKey || "\u0000", "***");
      console.error("فشل تحديث الأسعار:", msg);
      if (!cached) return json({ error: "تعذر جلب الأسعار" }, 502);
      // نكمل بآخر أسعار محفوظة، ونعيد المحاولة بعد 5 دقائق
      cached = { ...cached, checkedAt: Date.now() - ttl + RETRY_AFTER_FAILURE_MS };
      try { await store.setJSON("lme", cached); } catch { /* نتجاهل */ }
    }
  }

  return json({
    updatedAt: cached.priceTime,
    source: "LME (بورصة لندن للمعادن) عبر Metals.Dev",
    whatsappNumber: settings.whatsappNumber,
    items: buildItems(cached.rates, settings)
  });
};

export const config = { path: "/api/prices" };
