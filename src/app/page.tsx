import { redirect } from 'next/navigation';
import { auth } from './auth';

export default async function Index() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const user = session?.user;

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role && user.role == 'admin') {
    redirect('/admin/dashboard');
  }

  redirect('/products');
}
