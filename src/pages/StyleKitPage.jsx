import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Stack,
  Medal,
  PaintBrushBroad,
  FileCsv,
  ChartLineUp,
  QrCode,
  EnvelopeSimple,
  ShareNetwork,
  Code,
  Globe,
  Coins,
  Fingerprint,
  ChatCircleDots,
  Buildings,
  Pulse,
  Check,
} from "@phosphor-icons/react";
import IconBadge from "../components/ui/IconBadge";
import BrandIcon from "../components/ui/BrandIcon";
import Tag from "../components/ui/Tag";
import CheckBadge from "../components/ui/CheckBadge";
import Section from "../components/ui/Section";
import {
  Ring,
  Swirl,
  Blob,
  DotGrid,
  Guilloche,
  CertCorner,
  Seal,
  QrFragment,
  Perforation,
  Wave,
  TapeStrip,
  PaperClip,
} from "../components/ui/decor";

export default function StyleKitPage() {
  const tones = ["indigo", "sky", "sun", "orange", "green", "ink", "indigo-tint", "sky-tint", "orange-tint", "green-tint", "white", "paper"];

  return (
    <div className="bg-[#F7F7F8] min-h-screen p-8 text-[#0B0B14] font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="border-b border-slate-200 pb-6">
          <Link to="/" className="text-sm font-semibold text-indigo-600 no-underline hover:underline">
            ← Return to Home
          </Link>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">ProofDeck Style Kit & Tone Preview</h1>
          <p className="text-slate-500 text-sm mt-1">Badge + Bento visual language, Phosphor duotone icon badges, credential motifs, and tone surfaces.</p>
        </div>

        {/* 1. IconBadges in sizes and tones */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">1. Solid Icon Badges (Phosphor Duotone)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <IconBadge icon={ShieldCheck} tone="indigo" size="xl" tilt={-3} />
            <IconBadge icon={Stack} tone="sky" size="xl" tilt={0} />
            <IconBadge icon={Medal} tone="sun" size="xl" tilt={3} />
            <IconBadge icon={ChartLineUp} tone="orange" size="xl" />
            <IconBadge icon={QrCode} tone="green" size="xl" />
            <IconBadge icon={Code} tone="ink" size="xl" />
            <IconBadge icon={PaintBrushBroad} tone="indigo" size="lg" />
            <IconBadge icon={FileCsv} tone="sky" size="lg" />
            <IconBadge icon={EnvelopeSimple} tone="sky" size="md" />
            <IconBadge icon={Buildings} tone="indigo" size="sm" />
            <IconBadge icon={Pulse} tone="green" size="sm" />
          </div>

          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pt-4">All Tones (md size):</h3>
          <div className="flex flex-wrap gap-3">
            {tones.map((t) => (
              <div key={t} className="flex flex-col items-center gap-1.5">
                <IconBadge icon={ShieldCheck} tone={t} size="md" />
                <span className="text-[10px] text-slate-500 font-mono">{t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Pill Tags */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">2. Pill Tags with Tone Variants</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Tag tone="indigo" icon={PaintBrushBroad}>Design</Tag>
            <Tag tone="sky" icon={Stack}>Scale</Tag>
            <Tag tone="orange" icon={ChartLineUp}>Insights</Tag>
            <Tag tone="green" icon={ShieldCheck}>Trust</Tag>
            <Tag tone="sun" dot>Most Popular</Tag>
            <Tag tone="ink" dot>Enterprise</Tag>
            <Tag tone="paper">Default Pill</Tag>
          </div>
        </section>

        {/* 3. Check Badges */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">3. Check Badges (Replaces plain bullet dots)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <CheckBadge tone="indigo" size={20} />
              <span className="text-sm font-medium">Indigo Check Badge (20px)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckBadge tone="sky" size={20} />
              <span className="text-sm font-medium">Sky Check Badge</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckBadge tone="green" size={20} />
              <span className="text-sm font-medium">Green Check Badge</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckBadge tone="orange" size={20} />
              <span className="text-sm font-medium">Orange Check Badge</span>
            </div>
          </div>
        </section>

        {/* 4. Brand Icons */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">4. Real Brand Icons (react-icons original glyphs)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="linkedin" size={18} useBrandColor />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="x" size={18} useBrandColor />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="facebook" size={18} useBrandColor />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="instagram" size={18} useBrandColor />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="whatsapp" size={18} useBrandColor />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="youtube" size={18} useBrandColor />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <BrandIcon name="github" size={18} useBrandColor />
            </div>
          </div>
        </section>

        {/* 5. Credential Motifs & Decor */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold">5. Credential Motifs & Decor Elements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            <div className="p-6 bg-[#E9E7FD] rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden text-[#5144E8]">
              <Ring size={140} strokeWidth={18} color="currentColor" />
              <span className="text-xs font-bold mt-2 z-10">Ring</span>
            </div>
            <div className="p-6 bg-[#DDF1FD] rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden text-[#0A9AF5]">
              <Swirl size={120} strokeWidth={16} color="currentColor" />
              <span className="text-xs font-bold mt-2 z-10">Swirl</span>
            </div>
            <div className="p-6 bg-[#FEF8D6] rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden text-[#E3CE5B]">
              <Guilloche size={150} color="currentColor" opacity={0.35} />
              <span className="text-xs font-bold mt-2 z-10 text-[#713F12]">Guilloche</span>
            </div>
            <div className="p-6 bg-[#DDF5E6] rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden text-[#16A34A]">
              <Seal size={110} color="currentColor" opacity={0.35} />
              <span className="text-xs font-bold mt-2 z-10">Seal</span>
            </div>
            <div className="p-6 bg-[#FFE3CC] rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden text-[#F97316]">
              <QrFragment size={110} color="currentColor" opacity={0.35} />
              <span className="text-xs font-bold mt-2 z-10">QrFragment</span>
            </div>
            <div className="p-6 bg-slate-100 rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden text-slate-400">
              <CertCorner size={60} color="currentColor" opacity={0.6} />
              <span className="text-xs font-bold mt-2 z-10 text-slate-700">CertCorner</span>
            </div>
            <div className="p-6 bg-amber-50 rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden">
              <TapeStrip />
              <span className="text-xs font-bold mt-2 z-10 text-amber-800">TapeStrip</span>
            </div>
            <div className="p-6 bg-slate-100 rounded-2xl flex flex-col items-center justify-center h-40 relative overflow-hidden">
              <PaperClip size={44} color="#64748B" />
              <span className="text-xs font-bold mt-2 z-10 text-slate-700">PaperClip</span>
            </div>
          </div>
        </section>

        {/* 6. Section wrapper preview */}
        <Section
          tone="indigo"
          radius="xl"
          className="p-10 bg-[#5144E8] text-white"
          decor={
            <>
              <Ring size={320} strokeWidth={40} color="#3B2FC9" className="absolute -top-20 -right-20 opacity-40" />
              <Seal size={220} color="#3B2FC9" className="absolute -bottom-16 -left-16 opacity-30" />
            </>
          }
        >
          <div className="max-w-xl space-y-4">
            <Tag tone="sun" dot>Tone Section Wrapper</Tag>
            <h2 className="text-3xl font-extrabold text-white">Flat tone-on-tone panels without gradients</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Every card and section uses declarative tone attributes and credential decor shapes cropped neatly along borders.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
