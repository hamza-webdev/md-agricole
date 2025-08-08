'use client';

import { useSession } from 'next-auth/react';
import { HeaderContent } from './header-content';

export function HeaderWrapper() {
  const { data: session, status } = useSession();
  
  return <HeaderContent session={session} status={status} />;
}
