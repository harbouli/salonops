import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

const SERVICES = [
  { id: '1', nameFr: 'Coupe Femme + Brushing', duration: '45 min', price: '150 MAD', category: 'Coupe' },
  { id: '2', nameFr: 'Coloration Racine + Brushing', duration: '1h45', price: '350 MAD', category: 'Coloration', deposit: true },
  { id: '3', nameFr: 'Lissage Protéine / Caviar', duration: '3h00', price: '900 MAD', category: 'Lissage', deposit: true },
  { id: '4', nameFr: 'Brushing Simple Cheveux Longs', duration: '30 min', price: '80 MAD', category: 'Brushing' },
];

const STYLISTS = [
  { id: 'any', name: 'Première coiffeuse disponible', role: 'Attribution automatique' },
  { id: '1', name: 'Fatima', role: 'Coloriste Expert' },
  { id: '2', name: 'Salma', role: 'Spécialiste Lissage & Soin' },
];

const SLOTS = ['10:00', '11:15', '14:00', '15:30', '17:00', '18:15'];

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStylist, setSelectedStylist] = useState<any>(STYLISTS[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('14:00');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-[#121214] text-[#F4F4F5] flex justify-center">
      <div className="w-full max-w-md bg-[#121214] min-h-screen flex flex-col justify-between p-5">
        <div>
          {/* Header */}
          <header className="flex items-center justify-between py-4 border-b border-[#2A2A32] mb-6">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="p-2 rounded-full bg-[#1A1A1E] border border-[#2A2A32] text-[#A1A1AA]"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="w-8" />
            )}

            <div className="text-center">
              <h1 className="font-bold text-base tracking-wide">Salon Fatima</h1>
              <p className="text-xs text-[#A1A1AA]">Béni Mellal • Réservation</p>
            </div>

            <div className="w-8" />
          </header>

          {/* Step Progress Bar */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= s ? 'bg-[#D4AF37]' : 'bg-[#2A2A32]'
                }`}
              />
            ))}
          </div>

          {/* STEP 1: SERVICE PICKER */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold">1. Choisissez votre prestation</h2>
                <p className="text-xs text-[#A1A1AA]">Tarifs clairs, sans surprise au salon</p>
              </div>

              <div className="space-y-3">
                {SERVICES.map((s) => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-[#2B271A] border-[#D4AF37]'
                          : 'bg-[#1A1A1E] border-[#2A2A32] hover:border-[#3A3A44]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-[#F4F4F5]">{s.nameFr}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#A1A1AA]">
                            <Clock size={12} />
                            <span>{s.duration}</span>
                            {s.deposit && (
                              <span className="text-[#D4AF37]">• Acompte requis</span>
                            )}
                          </div>
                        </div>
                        <p className="font-bold text-base text-[#D4AF37]">{s.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: STYLIST & TIME PICKER */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">2. Choisissez la coiffeuse & l'heure</h2>
                <p className="text-xs text-[#A1A1AA]">Prestation : {selectedService?.nameFr}</p>
              </div>

              {/* Stylists */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Coiffeuse</p>
                <div className="space-y-2">
                  {STYLISTS.map((st) => {
                    const isSelected = selectedStylist.id === st.id;
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStylist(st)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center ${
                          isSelected ? 'bg-[#2B271A] border-[#D4AF37]' : 'bg-[#1A1A1E] border-[#2A2A32]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{st.name}</p>
                          <p className="text-xs text-[#A1A1AA]">{st.role}</p>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-[#D4AF37]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slots */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Créneau Aujourd'hui</p>
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-[#1A1A1E] text-[#F4F4F5] border-[#2A2A32] hover:bg-[#222228]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT & WHATSAPP CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold">3. Vos coordonnées</h2>
                <p className="text-xs text-[#A1A1AA]">Vous recevrez votre rappel de confirmation par WhatsApp</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-medium">Nom complet</label>
                  <input
                    type="text"
                    placeholder="Ex: Meryem Bennani"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1A1A1E] border border-[#2A2A32] rounded-xl px-4 py-3 text-sm text-[#F4F4F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-medium">Numéro de téléphone (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="06 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1A1A1E] border border-[#2A2A32] rounded-xl px-4 py-3 text-sm text-[#F4F4F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#1A1A1E] border border-[#2A2A32] text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Prestation :</span>
                    <span className="font-semibold text-right">{selectedService?.nameFr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Coiffeuse :</span>
                    <span className="font-semibold">{selectedStylist.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Créneau :</span>
                    <span className="font-semibold text-[#D4AF37]">Aujourd'hui à {selectedSlot}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#2A2A32] pt-2">
                    <span className="text-[#A1A1AA]">Total à régler au salon :</span>
                    <span className="font-bold text-[#D4AF37] text-sm">{selectedService?.price}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & WALLET PASS */}
          {step === 4 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#13281E] border border-[#10B981] flex items-center justify-center mx-auto text-[#10B981]">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#F4F4F5]">Rendez-vous Confirmé !</h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Un rappel WhatsApp vous sera envoyé 24h et 2h avant le rendez-vous.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#1A1A1E] border border-[#2A2A32] text-left text-xs space-y-2">
                <p className="font-bold text-sm text-[#D4AF37]">{selectedService?.nameFr}</p>
                <p className="text-[#A1A1AA]">Coiffeuse : <span className="text-[#F4F4F5]">{selectedStylist.name}</span></p>
                <p className="text-[#A1A1AA]">Date & Heure : <span className="text-[#F4F4F5]">Aujourd'hui à {selectedSlot}</span></p>
                <p className="text-[#A1A1AA]">Adresse : <span className="text-[#F4F4F5]">Boulevard Mohammed V, Béni Mellal</span></p>
              </div>

              {/* Apple & Google Wallet Pass Download */}
              <div className="space-y-3 pt-4 border-t border-[#2A2A32]">
                <p className="text-xs font-semibold text-[#A1A1AA]">Enregistrez votre carte fidélité sans installer d'application :</p>
                
                <button className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-200">
                  <span></span> Ajouter à Apple Wallet
                </button>

                <button className="w-full py-3 rounded-xl bg-[#202124] text-white border border-[#3C4043] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#303134]">
                  <span>G</span> Enregistrer dans Google Wallet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Next Button */}
        {step < 4 && (
          <div className="pt-4 border-t border-[#2A2A32]">
            <button
              disabled={step === 1 && !selectedService}
              onClick={() => setStep((s) => (s + 1) as any)}
              className="w-full py-4 rounded-xl bg-[#D4AF37] text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            >
              <span>{step === 3 ? 'Confirmer le Rendez-vous' : 'Continuer'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
