import React from "react";
import Navbar from "@/components/atoms/home_page/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-blue-200">
          <h1 className="text-2xl font-bold">Bem-vindo à página inicial do P.I.T.E.R</h1>
          <p className="text-gray-600 mt-2">Use a barra de pesquisa para começar.</p>
        </div>
      </main>
    </div>
  );
}
