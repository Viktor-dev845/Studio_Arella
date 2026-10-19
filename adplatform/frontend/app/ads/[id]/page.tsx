import { redirect } from 'next/navigation';

export default async function AdDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  redirect(`/my-ads/${resolvedParams.id}`);
}
