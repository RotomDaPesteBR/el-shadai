import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

export default async function RouteProtection({
  roles
}: {
  roles?: string[];
  locale?: string;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  } else {
    if (roles) {
      const user = session?.user;

      if (!roles.includes(user?.role)) {
        redirect('/');
      }
    }
  }

  return <></>;
}
