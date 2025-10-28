import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

export default async function RouteProtection({ roles }: { roles?: string[] }) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  } else {
    if (roles) {
      const user = session?.user;

      if (user) {
        if ((!user.role || !roles.includes(user.role)) && user.role != 'admin') {
          redirect('/');
        }
      } else {
        redirect('/auth/login');
      }
    }
  }

  return <></>;
}
