type LandingSectionEyebrowProps = {
  label: string;
};

export default function LandingSectionEyebrow({ label }: LandingSectionEyebrowProps) {
  return (
    <div className="phx-eyebrow">
      <span className="h-[6px] w-6 bg-white/90" />
      <span>{label}</span>
    </div>
  );
}
