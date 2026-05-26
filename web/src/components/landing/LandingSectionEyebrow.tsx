type LandingSectionEyebrowProps = {
  label: string;
};

export default function LandingSectionEyebrow({ label }: LandingSectionEyebrowProps) {
  return (
    <div className="inline-flex items-center gap-4 text-sm font-semibold text-white">
      <span className="h-[6px] w-6 bg-white/90" />
      <span>{label}</span>
    </div>
  );
}
