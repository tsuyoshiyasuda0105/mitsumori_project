import { EstimateEditor } from "@/components/estimate/EstimateEditor";
import { getEstimateOrBlank } from "@/lib/mock";

export default function Page({ params }: { params: { id: string } }) {
  const { estimate, isNew } = getEstimateOrBlank(params.id);
  return <EstimateEditor initial={estimate} isNew={isNew} />;
}
