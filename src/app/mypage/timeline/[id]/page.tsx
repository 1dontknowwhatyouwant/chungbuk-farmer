import TimelineDetail from "../../../../components/Mypage/timeline/detail/TimelineDetail";

export default async function TimelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TimelineDetail jobId={id} />;
}
