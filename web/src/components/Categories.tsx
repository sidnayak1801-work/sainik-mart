import { Apple, CupSoda, House, Milk, Sparkles, Wheat, type LucideIcon } from "lucide-react";
import { appConfig, type CategoryId } from "../config/appConfig";

const visuals: Record<CategoryId, { icon: LucideIcon; well: string; mark: string }> = {
  "fruits-vegetables": { icon: Apple, well: "bg-[#e7f3ea]", mark: "text-primary" },
  dairy: { icon: Milk, well: "bg-[#f6f1df]", mark: "text-gold" },
  bakery: { icon: Wheat, well: "bg-[#f4e8dc]", mark: "text-accent" },
  "snacks-beverages": { icon: CupSoda, well: "bg-[#f8ece6]", mark: "text-accent" },
  household: { icon: House, well: "bg-[#eceee8]", mark: "text-primary-light" },
  "personal-care": { icon: Sparkles, well: "bg-[#f3efe6]", mark: "text-gold" },
};

export default function Categories() {
  return (
    <section id="categories" className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Shop the aisle</p>
        <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-primary-dark sm:text-4xl">
          Categories you will recognise
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Fruits &amp; Vegetables, Dairy and Bakery match the store catalogue. The remaining
          ranges are typical grocery aisles — exact availability is always shown in the app.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {appConfig.categories.map((category) => {
            const visual = visuals[category.id];
            const Icon = visual.icon;
            return (
              <article
                key={category.id}
                className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-32 items-center justify-center ${visual.well}`}>
                  <span className={`rounded-2xl bg-white/80 p-4 shadow-sm ${visual.mark}`}>
                    <Icon size={28} />
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-ink">{category.name}</h3>
                    {category.fromCatalog ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        In catalogue
                      </span>
                    ) : (
                      <span className="rounded-full bg-wash px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Typical range
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
