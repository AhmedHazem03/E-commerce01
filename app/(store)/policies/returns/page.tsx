import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع والاستبدال",
};

export default async function ReturnPolicyPage() {
  const settings = await getStoreSettings();
  const storeName = settings.storeName;

  return (
    <div className="max-w-2xl mx-auto py-6 font-cairo">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        سياسة الاسترجاع والاستبدال — {storeName}
      </h1>

      {settings?.returnPolicy ? (
        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-cairo bg-surface rounded-lg p-4 border border-gray-200">
          {settings.returnPolicy}
        </pre>
      ) : (
        <div className="rounded-lg bg-surface border border-gray-200 px-6 py-10 text-center">
          <p className="text-gray-400 text-base">لا توجد سياسة استرجاع حالياً</p>
        </div>
      )}
    </div>
  );
}
