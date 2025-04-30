import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

export default async function AccessRouteProtection() {
  const session = await auth();

  if (session) redirect('/');

  return <></>;
}
