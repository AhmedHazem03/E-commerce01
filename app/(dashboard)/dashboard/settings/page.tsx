"use client";
// app/(dashboard)/settings/page.tsx
// Two sections: (1) Credentials — phone + password; (2) Store Settings — meta fields.

import { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Spinner from "@/components/atoms/Spinner";
import Divider from "@/components/atoms/Divider";

interface Settings {
  storeName: string;
  logo: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  returnPolicy: string | null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[--surface] p-6 flex flex-col gap-5">
      <h3 className="text-base font-bold text-[--text]">{title}</h3>
      <Divider />
      {children}
    </div>
  );
}

export default function SettingsPage() {
  // ─── Credentials form ───────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credMsg, setCredMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ─── Store settings form ────────────────────────────────────────────────────
  const [settings, setSettings] = useState<Settings>({
    storeName: "",
    logo: null,
    whatsappNumber: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    returnPolicy: null,
  });
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeMsg, setStoreMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Settings) => setSettings(data))
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  async function handleCredSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCredMsg(null);
    setCredSaving(true);
    try {
      const body: Record<string, string> = {};
      if (phone) body.phone = phone;
      if (password) body.password = password;

      const res = await fetch("/api/auth/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setCredMsg({ ok: true, text: "تم تحديث بيانات الدخول بنجاح ✓" });
        setPhone("");
        setPassword("");
      } else {
        const d = (await res.json()) as { error?: string };
        setCredMsg({ ok: false, text: d.error ?? "حدث خطأ" });
      }
    } finally {
      setCredSaving(false);
    }
  }

  async function handleStoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStoreMsg(null);
    setStoreSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setStoreMsg({ ok: true, text: "تم حفظ إعدادات المتجر ✓" });
      } else {
        const d = (await res.json()) as { error?: string };
        setStoreMsg({ ok: false, text: d.error ?? "حدث خطأ" });
      }
    } finally {
      setStoreSaving(false);
    }
  }

  function updateSetting<K extends keyof Settings>(key: K, val: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-xl font-bold text-[--text]">الإعدادات</h2>

      {/* ── Section 1: Credentials ────────────────────────────────────────────── */}
      <Section title="بيانات الدخول">
        <form onSubmit={handleCredSubmit} className="flex flex-col gap-4">
          <Input
            label="رقم الهاتف الجديد (اتركه فارغاً للإبقاء على الحالي)"
            type="tel"
            placeholder="01xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="كلمة المرور الجديدة (6 أحرف على الأقل)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {credMsg && (
            <p className={`text-sm ${credMsg.ok ? "text-green-600" : "text-[--danger]"}`}>
              {credMsg.text}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={credSaving || (!phone && !password)}>
              {credSaving ? <Spinner size="sm" /> : "تحديث بيانات الدخول"}
            </Button>
          </div>
        </form>
      </Section>

      {/* ── Section 2: Store Settings ─────────────────────────────────────────── */}
      <Section title="إعدادات المتجر">
        {loadingSettings ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : (
          <form onSubmit={handleStoreSubmit} className="flex flex-col gap-4">
            <Input
              label="اسم المتجر"
              value={settings.storeName}
              onChange={(e) => updateSetting("storeName", e.target.value)}
            />
            <Input
              label="رقم واتساب (بدون +، مثال: 201012345678)"
              type="tel"
              placeholder="201012345678"
              value={settings.whatsappNumber ?? ""}
              onChange={(e) => updateSetting("whatsappNumber", e.target.value || null)}
            />
            <Input
              label="رابط إنستجرام"
              type="url"
              placeholder="https://instagram.com/..."
              value={settings.instagram ?? ""}
              onChange={(e) => updateSetting("instagram", e.target.value || null)}
            />
            <Input
              label="رابط فيسبوك"
              type="url"
              placeholder="https://facebook.com/..."
              value={settings.facebook ?? ""}
              onChange={(e) => updateSetting("facebook", e.target.value || null)}
            />
            <Input
              label="رابط تيكتوك"
              type="url"
              placeholder="https://tiktok.com/..."
              value={settings.tiktok ?? ""}
              onChange={(e) => updateSetting("tiktok", e.target.value || null)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[--text]">
                سياسة الاستبدال والاسترجاع
                <span className="text-xs text-[--text-muted] mr-1">(اختياري)</span>
              </label>
              <textarea
                rows={5}
                value={settings.returnPolicy ?? ""}
                onChange={(e) => updateSetting("returnPolicy", e.target.value || null)}
                placeholder="اكتب سياسة الاسترجاع هنا..."
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--primary] resize-none"
              />
            </div>

            {storeMsg && (
              <p className={`text-sm ${storeMsg.ok ? "text-green-600" : "text-[--danger]"}`}>
                {storeMsg.text}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={storeSaving}>
                {storeSaving ? <Spinner size="sm" /> : "حفظ الإعدادات"}
              </Button>
            </div>
          </form>
        )}
      </Section>
    </div>
  );
}
