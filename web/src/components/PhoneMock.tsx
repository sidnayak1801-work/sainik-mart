const tiles = [
  { name: "Produce", tone: "bg-[#e8f3ea]", mark: "bg-primary-light" },
  { name: "Dairy", tone: "bg-[#f7f0de]", mark: "bg-gold" },
  { name: "Bakery", tone: "bg-[#f3e6d8]", mark: "bg-accent" },
  { name: "Home", tone: "bg-[#e8eee8]", mark: "bg-primary" },
];

export default function PhoneMock() {
  return (
    <div className="relative mx-auto w-[200px] sm:w-[250px] lg:w-[280px]">
      <div
        aria-hidden="true"
        className="absolute -left-10 top-10 hidden h-16 w-16 rounded-full bg-[#f2d48a] shadow-md lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute -right-8 top-28 hidden h-12 w-12 rounded-full bg-[#e85a20]/85 shadow-md lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute -left-6 bottom-20 hidden h-14 w-14 rounded-full bg-primary-light shadow-md lg:block"
      />

      <div className="absolute -left-20 top-20 hidden w-40 rounded-2xl border border-line bg-white p-3 shadow-lg lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">Fresh picks</p>
        <p className="mt-1 text-sm font-semibold text-ink">Vegetables & fruit</p>
      </div>
      <div className="absolute -right-16 bottom-28 hidden w-40 rounded-2xl border border-line bg-white p-3 shadow-lg lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Everyday</p>
        <p className="mt-1 text-sm font-semibold text-ink">Dairy & bakery</p>
      </div>

      <div className="rounded-[2.2rem] border-[10px] border-primary-dark bg-primary-dark shadow-2xl">
        <div className="overflow-hidden rounded-[1.55rem] bg-canvas">
          <div className="bg-primary px-4 pb-4 pt-2 text-white">
            <div className="mx-auto mb-3 h-4 w-24 rounded-b-2xl bg-black/20" />
            <div className="flex items-center gap-2">
              <img src="/images/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full bg-white" />
              <div>
                <p className="text-[10px] font-medium text-white/70">Sainik Mart</p>
                <p className="text-sm font-semibold leading-tight">Your neighbourhood store</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-[11px] text-white/80">
              Search everyday essentials
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {tiles.map((tile) => (
              <div key={tile.name} className={`rounded-2xl ${tile.tone} p-3`}>
                <span className={`mb-3 block h-8 w-8 rounded-xl ${tile.mark}`} />
                <p className="text-[11px] font-semibold text-ink">{tile.name}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 px-3 pb-5">
            {["Toned Milk", "Bananas"].map((name) => (
              <div key={name} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2">
                <span className="h-9 w-9 rounded-xl bg-wash" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">{name}</p>
                  <p className="text-[10px] text-muted">In the app catalogue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">Illustrative preview — not an app screenshot</p>
    </div>
  );
}
