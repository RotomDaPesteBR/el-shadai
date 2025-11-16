import RouteProtection from '@/components/server/RouteProtection';

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RouteProtection roles={['delivery']} />
      {children}
    </>
  );
}
