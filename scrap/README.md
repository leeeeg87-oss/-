# حديد وخزين

## الملفات
- `config.json`: **ملف الإعدادات الوحيد** (سعر الدولار، نسبة كل نوع، رقم الواتساب).
- `netlify/functions/prices.mjs`: يجيب الأسعار من Metals.Dev ويخزنها ساعة في Netlify Blobs.
- `netlify/lib/pricing.mjs`: يحوّل من دولار/طن إلى ريال/كيلو وريال/طن ويطبّق النسب.
- `public/`: الواجهة (index.html) وملفات التطبيق (manifest, sw.js, الأيقونات).

## تغيير النسب والأسعار
افتح `config.json` وعدّل `percent` لأي نوع (70 تعني 70% من السعر العالمي)، ثم ارفع الملفات من جديد.
الحديد سعره ثابت (`manualSarPerKg`) لأن Metals.Dev ما يوفر سعر حديد.
الستيل (ستانلس) محسوب كنسبة من النيكل. الأرقام الحالية **أمثلة**، عدّلها حسب سوقك.

## الرفع على Netlify
1. ادخل https://app.netlify.com وسجّل دخول.
2. Add new site ← Deploy manually ← اسحب مجلد `scrap` كاملاً.
   (إذا ما اشتغلت الدالة بالسحب، استخدم GitHub: ارفع المجلد على مستودع، ثم Add new site ← Import from Git.)
3. Site configuration ← Environment variables ← Add a variable:
   - Key: `METALS_DEV_API_KEY`
   - Value: مفتاحك من https://metals.dev (لوحة التحكم)
4. Deploys ← Trigger deploy ← Deploy site.
5. جرّب `https://اسم-موقعك.netlify.app/api/prices`: لازم يطلع JSON فيه الأسعار.

## ملاحظات
- الخطة المجانية في Metals.Dev للتجربة فقط. للاستخدام التجاري تحتاج خطة Copper المدفوعة (شروطهم تشترط اشتراكاً فعّالاً).
- الأسعار تُحدّث مرة كل ساعة، فتستهلك نحو 720 طلباً شهرياً.
- إذا ظهرت أسعار غير منطقية، الدالة ترفضها وتبقي آخر أسعار سليمة.
