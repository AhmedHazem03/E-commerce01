"use client";
// app/(dashboard)/dashboard/landing/page.tsx
// Admin control for all landing page sections

import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import Divider from "@/components/atoms/Divider";
import Input from "@/components/atoms/Input";
import type { LandingPageConfig } from "@/lib/interfaces/admin";
import { defaultLandingConfig } from "@/lib/interfaces/admin";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-plum" : "bg-gray-300"
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-sm font-cairo text-[--text]">{label}</span>
    </label>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[--surface] p-6 flex flex-col gap-4">
      <h3 className="text-base font-bold text-[--text] font-cairo">{title}</h3>
      <Divider />
      {children}
    </div>
  );
}

type IStoreSettingsWithLP = {
  landingPage: LandingPageConfig;
};

export default function LandingPageAdmin() {
  const [config, setConfig] = useState<LandingPageConfig>(defaultLandingConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: IStoreSettingsWithLP) => {
        if (data.landingPage) setConfig(data.landingPage);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof LandingPageConfig>(
    section: K,
    patch: Partial<LandingPageConfig[K]>
  ) {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  }

  async function handleSave() {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingPage: config }),
      });
      if (res.ok) {
        setMsg({ ok: true, text: "✓ تم حفظ إعدادات الصفحة الرئيسية بنجاح" });
      } else {
        const d = (await res.json()) as { error?: string };
        setMsg({ ok: false, text: d.error ?? "حدث خطأ" });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-cairo text-[--text]">
          إعدادات الصفحة الرئيسية
        </h2>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : "حفظ التغييرات"}
        </Button>
      </div>

      {msg && (
        <p
          className={`text-sm font-cairo px-4 py-2 rounded-xl ${
            msg.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* ── Announcement Bar ── */}
      <SectionCard title="🔔 شريط الإعلان (أعلى الصفحة)">
        <Toggle
          checked={config.announcementBar.enabled}
          onChange={(v) => update("announcementBar", { enabled: v })}
          label="تفعيل شريط الإعلان"
        />
        {config.announcementBar.enabled && (
          <Input
            label="نص الإعلان"
            value={config.announcementBar.text}
            onChange={(e) => update("announcementBar", { text: e.target.value })}
            placeholder="مثال: 🎁 شحن مجاني على الطلبات فوق ٣٠٠ جنيه"
          />
        )}
      </SectionCard>

      {/* ── Marquee ── */}
      <SectionCard title="📢 الشريط المتحرك">
        <Toggle
          checked={config.marquee.enabled}
          onChange={(v) => update("marquee", { enabled: v })}
          label="تفعيل الشريط المتحرك"
        />
        {config.marquee.enabled && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[--text] font-cairo">
              عناصر الشريط (سطر لكل عنصر)
            </label>
            <textarea
              rows={5}
              value={config.marquee.items.join("\n")}
              onChange={(e) =>
                update("marquee", {
                  items: e.target.value.split("\n").filter((l) => l.trim()),
                })
              }
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-[--primary] resize-none"
              placeholder={"🔥 تخفيضات الصيف وصلت\nشحن مجاني فوق ٣٠٠ جنيه"}
              dir="rtl"
            />
          </div>
        )}
      </SectionCard>

      {/* ── Flash Sale ── */}
      <SectionCard title="⏱ عرض العد التنازلي (Flash Sale)">
        <Toggle
          checked={config.flashSale.enabled}
          onChange={(v) => update("flashSale", { enabled: v })}
          label="تفعيل قسم Flash Sale"
        />
        {config.flashSale.enabled && (
          <>
            <Input
              label="عنوان العرض"
              value={config.flashSale.title}
              onChange={(e) => update("flashSale", { title: e.target.value })}
              placeholder="مثال: عرض ليوم واحد فقط 🔥"
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[--text] font-cairo">
                تاريخ/وقت انتهاء العرض
              </label>
              <input
                type="datetime-local"
                value={config.flashSale.endsAt.slice(0, 16)}
                onChange={(e) =>
                  update("flashSale", {
                    endsAt: new Date(e.target.value).toISOString(),
                  })
                }
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-[--primary]"
              />
            </div>
          </>
        )}
      </SectionCard>

      {/* ── New Arrivals ── */}
      <SectionCard title="✨ وصل حديثًا">
        <Toggle
          checked={config.newArrivals.enabled}
          onChange={(v) => update("newArrivals", { enabled: v })}
          label="تفعيل قسم الوصول الجديد"
        />
        {config.newArrivals.enabled && (
          <>
            <Input
              label="عنوان القسم"
              value={config.newArrivals.title}
              onChange={(e) => update("newArrivals", { title: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[--text] font-cairo">
                عدد المنتجات المعروضة
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={config.newArrivals.limit}
                onChange={(e) =>
                  update("newArrivals", { limit: Number(e.target.value) })
                }
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-cairo w-24 focus:outline-none focus:ring-2 focus:ring-[--primary]"
              />
            </div>
          </>
        )}
      </SectionCard>

      {/* ── Offers Section ── */}
      <SectionCard title="🎯 قسم العروض والتخفيضات">
        <Toggle
          checked={config.offersSection.enabled}
          onChange={(v) => update("offersSection", { enabled: v })}
          label="تفعيل قسم العروض"
        />
        {config.offersSection.enabled && (
          <>
            <Input
              label="عنوان القسم"
              value={config.offersSection.title}
              onChange={(e) => update("offersSection", { title: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[--text] font-cairo">
                عدد المنتجات المعروضة
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={config.offersSection.limit}
                onChange={(e) =>
                  update("offersSection", { limit: Number(e.target.value) })
                }
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-cairo w-24 focus:outline-none focus:ring-2 focus:ring-[--primary]"
              />
            </div>
            <p className="text-xs text-[--text-muted] font-cairo bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
              💡 يعرض تلقائيًا المنتجات التي لها سعر قبل التخفيض — حتّ السعر القديم للمنتج من صفحة المنتجات لتظهر هنا.
            </p>
          </>
        )}
      </SectionCard>

      {/* ── Brand Story ── */}
      <SectionCard title="📖 قصتنا">
        <Toggle
          checked={config.brandStory.enabled}
          onChange={(v) => update("brandStory", { enabled: v })}
          label="تفعيل قسم قصة المتجر"
        />
        {config.brandStory.enabled && (
          <>
            <Input
              label="عنوان رئيسي"
              value={config.brandStory.headline}
              onChange={(e) => update("brandStory", { headline: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[--text] font-cairo">
                نص القصة
              </label>
              <textarea
                rows={4}
                value={config.brandStory.body}
                onChange={(e) => update("brandStory", { body: e.target.value })}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-[--primary] resize-none"
                dir="rtl"
              />
            </div>
            <Input
              label="رابط صورة القصة (URL)"
              type="url"
              value={config.brandStory.image}
              onChange={(e) => update("brandStory", { image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </>
        )}
      </SectionCard>

      <div className="flex justify-end pb-8">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" /> : "حفظ جميع التغييرات"}
        </Button>
      </div>
    </div>
  );
}
