'use client';

import React from 'react';
import DashboardCharts from '@/components/organisms/DashboardCharts';
import Navbar_sec from '@/components/atoms/Navbar_sec';

export default function DashboardPage() {
  return (
    <main className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Navbar_sec />
        </div>
        <DashboardCharts />
      </div>
    </main>
  );
}
