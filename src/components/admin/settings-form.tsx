"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type HeroSlide = {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
};

type Settings = {
  heroSlides: HeroSlide[];
  announcementText: string;
  welcomeMessage: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  iziPostApiKey: string | null;
  iziPostApiUrl: string;
  footerText: string;
  freeShippingThreshold: number;
  maxOrdersPerPhonePerDay: number;
  newsletterPopupEnabled: boolean;
  newsletterDiscountPct: number;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-6">
      <h3 className="text-[15px] font-bold text-[#062F35] mb-1">{title}</h3>
      {description && (
        <p className="text-[12px] text-[rgba(18,18,18,0.4)] mb-5">{description}</p>
      )}
      {!description && <div className="mb-5" />}
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  helpText?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#062F35] mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[44px] px-4 border-2 border-[#E8E8E8] rounded-[8px] text-[13px] text-[#062F35] outline-none focus:border-[#062F35] transition-colors bg-white"
      />
      {helpText && (
        <p className="text-[11px] text-[rgba(18,18,18,0.35)] mt-1">{helpText}</p>
      )}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [announcement, setAnnouncement] = useState(settings.announcementText);
  const [welcome, setWelcome] = useState(settings.welcomeMessage);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsappEnabled);
  const [footerText, setFooterText] = useState(settings.footerText);
  const [iziPostApiKey, setIziPostApiKey] = useState(settings.iziPostApiKey || "");
  const [iziPostApiUrl, setIziPostApiUrl] = useState(settings.iziPostApiUrl);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(settings.freeShippingThreshold ?? 30),
  );
  const [maxOrdersPerPhone, setMaxOrdersPerPhone] = useState(
    String(settings.maxOrdersPerPhonePerDay ?? 3),
  );
  const [newsletterPopupEnabled, setNewsletterPopupEnabled] = useState(
    settings.newsletterPopupEnabled ?? true,
  );
  const [newsletterDiscountPct, setNewsletterDiscountPct] = useState(
    String(settings.newsletterDiscountPct ?? 5),
  );

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(
    Array.isArray(settings.heroSlides) && settings.heroSlides.length > 0
      ? settings.heroSlides
      : [
          {
            title: "Gjithçka për shtëpinë tuaj",
            subtitle: "Zbulo produkte të reja për shtëpi, kuzhinë dhe familje",
            buttonText: "Shiko produktet",
            buttonLink: "/koleksion/te-gjitha",
            image: "",
          },
        ]
  );

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroSlides,
          announcementText: announcement,
          welcomeMessage: welcome,
          whatsappNumber,
          whatsappEnabled,
          footerText,
          iziPostApiKey: iziPostApiKey || null,
          iziPostApiUrl,
          freeShippingThreshold: Number(freeShippingThreshold) || 0,
          maxOrdersPerPhonePerDay: Math.max(1, parseInt(maxOrdersPerPhone) || 3),
          newsletterPopupEnabled,
          newsletterDiscountPct: Math.max(0, Math.min(50, parseInt(newsletterDiscountPct) || 5)),
        }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Gabim gjatë ruajtjes");
    } finally {
      setSaving(false);
    }
  }

  function addSlide() {
    setHeroSlides([
      ...heroSlides,
      { title: "", subtitle: "", buttonText: "Shiko produktet", buttonLink: "/koleksion/te-gjitha", image: "" },
    ]);
  }

  function removeSlide(index: number) {
    setHeroSlides(heroSlides.filter((_, i) => i !== index));
  }

  function updateSlide(index: number, field: keyof HeroSlide, value: string) {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: value };
    setHeroSlides(updated);
  }

  return (
    <div className="space-y-6 max-w-[800px]">
      {/* Hero Slides */}
      <SectionCard
        title="Hero Banner"
        description="Menaxho slides e hero bannerit në faqen kryesore"
      >
        <div className="space-y-4">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className="border-2 border-[#F0F0F0] rounded-[10px] p-4 relative"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#062F35]">
                  Slide {i + 1}
                </p>
                {heroSlides.length > 1 && (
                  <button
                    onClick={() => removeSlide(i)}
                    className="text-[11px] text-[#C62828] hover:text-[#E53935] font-bold cursor-pointer"
                  >
                    Fshij
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField
                  label="Titulli"
                  value={slide.title}
                  onChange={(v) => updateSlide(i, "title", v)}
                  placeholder="Gjithçka për shtëpinë tuaj"
                />
                <InputField
                  label="Nëntitulli"
                  value={slide.subtitle}
                  onChange={(v) => updateSlide(i, "subtitle", v)}
                  placeholder="Zbulo produkte të reja"
                />
                <InputField
                  label="Teksti i butonit"
                  value={slide.buttonText}
                  onChange={(v) => updateSlide(i, "buttonText", v)}
                  placeholder="Shiko produktet"
                />
                <InputField
                  label="Linku i butonit"
                  value={slide.buttonLink}
                  onChange={(v) => updateSlide(i, "buttonLink", v)}
                  placeholder="/koleksion/te-gjitha"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="URL e fotos"
                    value={slide.image}
                    onChange={(v) => updateSlide(i, "image", v)}
                    placeholder="https://..."
                    helpText="Lër bosh për background default"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addSlide}
            className="w-full py-3 border-2 border-dashed border-[#E0E0E0] rounded-[10px] text-[12px] font-bold text-[rgba(18,18,18,0.4)] hover:border-[#062F35] hover:text-[#062F35] transition-colors cursor-pointer"
          >
            + Shto slide të ri
          </button>
        </div>
      </SectionCard>

      {/* Announcement Bar */}
      <SectionCard
        title="Shiriti i njoftimeve"
        description="Teksti që shfaqet në shiritin e sipërm të faqes"
      >
        <InputField
          label="Teksti"
          value={announcement}
          onChange={setAnnouncement}
          placeholder="Dërgim falas për porosi mbi €30"
        />
      </SectionCard>

      {/* WhatsApp */}
      <SectionCard
        title="WhatsApp"
        description="Konfiguro widgetin e WhatsApp në faqe"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#062F35]">Aktiv</p>
              <p className="text-[11px] text-[rgba(18,18,18,0.4)]">
                Shfaq butonin e WhatsApp në dyqan
              </p>
            </div>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`w-[48px] h-[26px] rounded-full transition-colors cursor-pointer relative ${
                whatsappEnabled ? "bg-[#062F35]" : "bg-[#E0E0E0]"
              }`}
            >
              <div
                className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform shadow-sm ${
                  whatsappEnabled ? "translate-x-[24px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>
          <InputField
            label="Numri"
            value={whatsappNumber}
            onChange={setWhatsappNumber}
            placeholder="+38344000000"
            helpText="Formati ndërkombëtar, pa hapësira"
          />
        </div>
      </SectionCard>

      {/* Footer */}
      <SectionCard title="Footer" description="Teksti i footert në fund të faqes">
        <InputField
          label="Teksti"
          value={footerText}
          onChange={setFooterText}
          placeholder="Produkte cilësore për shtëpinë"
        />
      </SectionCard>

      {/* Izi Post */}
      <SectionCard
        title="Izi Post — Dërgesa"
        description="Konfiguro integrimin me Izi Post për menaxhimin e dërgesave"
      >
        <div className="space-y-4">
          <InputField
            label="API Key"
            value={iziPostApiKey}
            onChange={setIziPostApiKey}
            type="password"
            placeholder="Shkruaj API key"
            helpText="Do ta merrni nga Izi Post"
          />
          <InputField
            label="API URL"
            value={iziPostApiUrl}
            onChange={setIziPostApiUrl}
            placeholder="https://api.izis-post.com"
          />
        </div>
      </SectionCard>

      {/* Commerce rules */}
      <SectionCard
        title="Rregullat e shitjes"
        description="Kufijtë e dërgimit dhe mbrojtja nga porositë e rreme"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            label="Dërgim falas mbi (€)"
            type="number"
            value={freeShippingThreshold}
            onChange={setFreeShippingThreshold}
            placeholder="30"
            helpText="Shfaqet si shiritë progresi në shportë"
          />
          <InputField
            label="Max porosi/telefon/ditë"
            type="number"
            value={maxOrdersPerPhone}
            onChange={setMaxOrdersPerPhone}
            placeholder="3"
            helpText="Mbrojtje kundër porosive të rreme"
          />
        </div>
      </SectionCard>

      {/* Newsletter popup */}
      <SectionCard
        title="Popup i Newsletter"
        description="Oferta e mirëseardhjes për porosinë e parë"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#062F35]">Aktiv</p>
              <p className="text-[11px] text-[rgba(18,18,18,0.4)]">
                Shfaq popup pas 25s ose në exit-intent
              </p>
            </div>
            <button
              onClick={() => setNewsletterPopupEnabled(!newsletterPopupEnabled)}
              className={`w-[48px] h-[26px] rounded-full transition-colors cursor-pointer relative ${
                newsletterPopupEnabled ? "bg-[#062F35]" : "bg-[#E0E0E0]"
              }`}
            >
              <div
                className={`w-[22px] h-[22px] bg-white rounded-full absolute top-[2px] transition-transform shadow-sm ${
                  newsletterPopupEnabled ? "translate-x-[24px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>
          <InputField
            label="Zbritja (%)"
            type="number"
            value={newsletterDiscountPct}
            onChange={setNewsletterDiscountPct}
            placeholder="5"
            helpText="Përqindja e zbritjes për porosinë e parë (0-50)"
          />
        </div>
      </SectionCard>

      {/* Save button */}
      <div className="sticky bottom-0 bg-[#F8F9FA] py-4 border-t border-[#E8E8E8] -mx-6 md:-mx-8 px-6 md:px-8 flex items-center justify-between">
        <div>
          {saved && (
            <p className="text-[12px] font-bold text-[#2E7D32] flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Cilësimet u ruajtën me sukses
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#062F35] text-white text-[13px] font-bold px-6 py-2.5 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {saving ? "Duke ruajtur..." : "Ruaj cilësimet"}
        </button>
      </div>
    </div>
  );
}
