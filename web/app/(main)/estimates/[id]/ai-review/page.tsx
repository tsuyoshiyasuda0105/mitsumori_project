import { AiReview } from "@/components/focus/AiReview";

export default function Page({ params }: { params: { id: string } }) {
  return <AiReview estimateId={params.id} />;
}
