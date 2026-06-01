import { VoiceCapture } from "@/components/focus/VoiceCapture";
import { getEstimateOrBlank } from "@/lib/mock";

export default function Page({ params }: { params: { id: string } }) {
  const { estimate } = getEstimateOrBlank(params.id);
  return <VoiceCapture estimateId={params.id} title={estimate.title} />;
}
