import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, Section } from "@/components/site/StaticPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/size-guide")({
  head: () =>
    pageHead(
      "Size Guide — HOK",
      "Body measurements and fit guidance for HOK kurtis, kurtas, kurta sets and co-ord sets.",
    ),
  component: SizeGuidePage,
});

const rows = [
  { size: "XS", bust: "32", waist: "26", hip: "35" },
  { size: "S", bust: "34", waist: "28", hip: "37" },
  { size: "M", bust: "36", waist: "30", hip: "39" },
  { size: "L", bust: "38", waist: "32", hip: "41" },
  { size: "XL", bust: "40", waist: "34", hip: "43" },
  { size: "XXL", bust: "42", waist: "36", hip: "45" },
];

function SizeGuidePage() {
  return (
    <StaticPage
      eyebrow="Fit"
      title="Size Guide"
      intro="All measurements are body measurements in inches. Garment measurements include ease and vary by silhouette — check the product page for style-specific notes."
    >
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <caption className="sr-only">HOK body measurements in inches</caption>
          <thead className="bg-secondary text-xs uppercase tracking-[0.14em] text-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Size</th>
              <th scope="col" className="px-4 py-3">Bust</th>
              <th scope="col" className="px-4 py-3">Waist</th>
              <th scope="col" className="px-4 py-3">Hip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.size}>
                <th scope="row" className="px-4 py-3 font-normal text-foreground">
                  {r.size}
                </th>
                <td className="px-4 py-3">{r.bust}"</td>
                <td className="px-4 py-3">{r.waist}"</td>
                <td className="px-4 py-3">{r.hip}"</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs">
        Placeholder chart — replace with your verified production measurements
        before launch.
      </p>

      <Section heading="How to measure">
        <p><strong>Bust:</strong> around the fullest part, tape parallel to the floor.</p>
        <p><strong>Waist:</strong> around the narrowest part of your natural waist.</p>
        <p><strong>Hip:</strong> around the fullest part, roughly 8" below the waist.</p>
      </Section>
      <Section heading="Between sizes?">
        <p>
          Size up for a relaxed drape, especially on straight kurtas and co-ord
          sets. For fitted kurtis, stay with your usual size.
        </p>
      </Section>
    </StaticPage>
  );
}
