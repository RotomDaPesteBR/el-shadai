'use client';

import React, { createContext, useMemo, useState } from 'react';

const GetDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

export const DateContext = createContext<React.ComponentState>(null);

export default function DateProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(GetDate());

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate
    }),
    [selectedDate]
  );

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

export function useDate() {
  const context = React.useContext(DateContext);
  if (!context) {
    throw new Error(`DateContext not found`);
  }
  return context;
}
