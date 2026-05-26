import ProfileGlyph from "./ProfileGlyph";
import LandingSectionEyebrow from "./LandingSectionEyebrow";
import { operatingProfiles } from "./landing-data";

export default function BuiltForSection() {
  return (
    <section id="built-for">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div className="space-y-8">
          <LandingSectionEyebrow label="Built for" />
          <h2 className="phx-display max-w-lg text-5xl leading-[0.96] sm:text-6xl">
            Who is Phylax
            <br />
            for?
          </h2>
          <p className="phx-body max-w-md text-base sm:text-[17px]">
            Developers and Web3 teams deploying autonomous financial AI that requires ironclad
            on-chain safety, strict risk boundaries, and absolute control over automated capital.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {operatingProfiles.map((profile) => (
            <div
              key={profile.name}
              className="group flex min-h-[184px] flex-col justify-between border border-white/6 bg-white/[0.03] p-6 transition hover:border-white hover:bg-white"
            >
              <div className="flex justify-end text-zinc-400 transition group-hover:text-black">
                <ProfileGlyph kind={profile.icon} />
              </div>
              <span className="max-w-[12ch] text-[2rem] font-bold leading-[1.08] tracking-[-0.05em] text-white transition group-hover:text-black">
                {profile.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
