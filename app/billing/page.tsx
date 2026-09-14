import { PageHeader } from "@/components/page-header";
import { PosEngine } from "./pos-engine";

export default function BillingPage() {
  return (
    <>
      <PageHeader title="New Bill" subtitle="Fast POS entry with GST-inclusive, GST-exclusive, and no-GST pricing modes." />
      <section className="mt-4">
        <PosEngine />
      </section>
    </>
  );
}
