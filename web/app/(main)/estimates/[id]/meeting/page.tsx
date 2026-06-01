import { MeetingRecorder } from "@/components/focus/MeetingRecorder";
import { customerName, getEstimateOrBlank } from "@/lib/mock";

export default function Page({ params }: { params: { id: string } }) {
  const { estimate } = getEstimateOrBlank(params.id);
  return (
    <MeetingRecorder
      estimateId={params.id}
      title={estimate.title}
      customer={customerName(estimate.customerId)}
      assignee={estimate.assignee}
    />
  );
}
