import { ExportSettings } from "@/components/focus/ExportSettings";
import { getEstimateOrBlank } from "@/lib/mock";

export default function Page({ params }: { params: { id: string } }) {
  const { estimate } = getEstimateOrBlank(params.id);
  return <ExportSettings estimate={estimate} />;
}
