import CenterMatchingPage from "../../components/CenterMatchingPage/CenterMatchingPage";

type Props = { searchParams: Promise<{ postingIds?: string | string[] }> };

export default async function Page({ searchParams }: Props) {
  const { postingIds } = await searchParams;
  const raw = Array.isArray(postingIds) ? postingIds.join(",") : postingIds ?? "";
  const selectedPostingIds = Array.from(new Set(raw.split(",").filter((value) => /^\d+$/.test(value)).map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))).slice(0, 100);
  return <CenterMatchingPage selectedPostingIds={selectedPostingIds} />;
}
