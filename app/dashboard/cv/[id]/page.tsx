import { CvEditor } from "@/components/cv-editor";

// dynamic route — blocking render biar params tersedia
export const instant = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CvEditor id={id} />;
}
