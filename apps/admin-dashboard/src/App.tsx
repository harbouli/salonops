import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Scissors,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'caisse' | 'stylists' | 'ai'>('overview');

  return (
    <div className="flex min-h-screen bg-[#121214] text-[#F4F4F5]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2A2A32] bg-[#1A1A1E] p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#2B271A] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold">
              SO
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">SalonOps</h1>
              <p className="text-xs text-[#A1A1AA]">Béni Mellal • Branch #1</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
              { id: 'caisse', label: 'Caisse & Clôture', icon: DollarSign },
              { id: 'stylists', label: 'Coiffeuses & Paie', icon: Users },
              { id: 'ai', label: 'Intelligence Maroc', icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#2B271A] text-[#D4AF37] border border-[#D4AF37]/30'
                      : 'text-[#A1A1AA] hover:bg-[#222228] hover:text-[#F4F4F5]'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 rounded-xl bg-[#222228] border border-[#2A2A32] text-xs">
          <p className="font-semibold text-[#F4F4F5]">Fatima Zahra</p>
          <p className="text-[#A1A1AA]">Propriétaire (Owner)</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Tableau de Bord Salon</h2>
            <p className="text-sm text-[#A1A1AA]">Vendredi, 18 Septembre 2026</p>
          </div>

          <div className="flex gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13281E] border border-[#10B981] text-[#A7F3D0] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Synchronisé en direct
            </span>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32]">
            <p className="text-xs text-[#A1A1AA] font-medium">Chiffre d'Affaires Jour</p>
            <p className="text-2xl font-bold text-[#D4AF37] mt-1">4 850 MAD</p>
            <p className="text-xs text-[#10B981] mt-2">+18% vs vendredi dernier</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32]">
            <p className="text-xs text-[#A1A1AA] font-medium">Rendez-vous Aujourd'hui</p>
            <p className="text-2xl font-bold text-[#F4F4F5] mt-1">16 Clientes</p>
            <p className="text-xs text-[#A1A1AA] mt-2">12 confirmés • 4 en cours</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32]">
            <p className="text-xs text-[#A1A1AA] font-medium">Taux de No-Show</p>
            <p className="text-2xl font-bold text-[#10B981] mt-1">0% (0 lapin)</p>
            <p className="text-xs text-[#A1A1AA] mt-2">Grâce aux rappels WhatsApp</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32]">
            <p className="text-xs text-[#A1A1AA] font-medium">Pourboires Attribués</p>
            <p className="text-2xl font-bold text-[#F4F4F5] mt-1">320 MAD</p>
            <p className="text-xs text-[#D4AF37] mt-2">Fatima: 180 DH • Salma: 140 DH</p>
          </div>
        </div>

        {/* Main Grid: Stylist Occupancy & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Stylist Timeline */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#D4AF37]" />
              Planning des Coiffeuses (Béni Mellal)
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Fatima', role: 'Coloriste Expert', status: 'En Prestation', client: 'Meryem Bennani (Coloration Racine)', time: '10:00 - 11:45', buffer: '15m' },
                { name: 'Salma', role: 'Lissage & Soin', status: 'Libre à 14h00', client: 'Samira Idrissi (Lissage Protéine)', time: '14:00 - 17:00', buffer: '20m' },
                { name: 'Youssef', role: 'Coupe & Brushing', status: 'Jour de Congé', client: '—', time: '—', buffer: '—' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#121214] border border-[#2A2A32] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#F4F4F5]">{s.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#222228] text-[#A1A1AA]">{s.role}</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1">{s.client}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2B271A] text-[#D4AF37] border border-[#D4AF37]/30">
                      {s.status}
                    </span>
                    <p className="text-xs text-[#A1A1AA] mt-1">{s.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Moroccan Insights */}
          <div className="p-6 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#D4AF37]" />
                Insights IA & Churn
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#2B1A1E] border border-[#E11D48]/30">
                  <p className="text-xs font-bold text-[#FECDD3]">Alerte Heures Creuses</p>
                  <p className="text-xs text-[#F4F4F5] mt-1">
                    Mardi prochain (10h-14h) est à 75% vide. Promo WhatsApp suggérée aux clientes du quartier.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#13281E] border border-[#10B981]/30">
                  <p className="text-xs font-bold text-[#A7F3D0]">Score Avis Google (Béni Mellal)</p>
                  <p className="text-xs text-[#F4F4F5] mt-1">
                    12 nouveaux avis 5★ cette semaine via le filtre intelligent. Salon classé #1 sur Google Maps !
                  </p>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-sm hover:opacity-90 transition-opacity">
              Poser une question en Darija / Français
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
