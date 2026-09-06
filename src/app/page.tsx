'use client';
import { useState } from 'react';

interface PatientVisit {
  id: string;
  name: string;
  opNumber: string;
  stage: 'Registration' | 'Triage' | 'Doctor (SOAP)' | 'Lab' | 'Pharmacy' | 'Billing' | 'Completed';
  vitals?: { bp: string; temp: string; hr: string; weight: string };
  soap?: { subjective: string; objective: string; assessment: string; plan: string };
  labOrders?: string;
  prescriptions?: string;
  billingAmount?: number;
  paid?: boolean;
}

export default function ClinicalWorkflow() {
  const [activeTab, setActiveTab] = useState<'register' | 'triage' | 'doctor' | 'pharmacy' | 'billing'>('register');
  const [visits, setVisits] = useState<PatientVisit[]>([
    {
      id: '1',
      name: 'Toni Braxton',
      opNumber: 'OP-2026-001',
      stage: 'Doctor (SOAP)',
      vitals: { bp: '120/80', temp: '36.8°C', hr: '72 bpm', weight: '68 kg' },
      soap: { subjective: 'Persistent cough and slight fever for 3 days', objective: 'Chest clear, throat mildly inflamed', assessment: 'Upper Respiratory Tract Infection', plan: 'Paracetamol 500mg, Amoxicillin 500mg' },
      prescriptions: 'Paracetamol 500mg TDS, Amoxicillin 500mg TDS',
      billingAmount: 1500,
      paid: false,
    }
  ]);

  // Form States
  const [regName, setRegName] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState<string>('1');
  const [vitalsInput, setVitalsInput] = useState({ bp: '', temp: '', hr: '', weight: '' });
  const [soapInput, setSoapInput] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [rxInput, setRxInput] = useState('');
  const [billInput, setBillInput] = useState<number>(0);

  // Handlers
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;
    const newVisit: PatientVisit = {
      id: Date.now().toString(),
      name: regName,
      opNumber: `OP-2026-00${visits.length + 1}`,
      stage: 'Triage',
    };
    setVisits([...visits, newVisit]);
    setRegName('');
    alert(`Patient Registered! Assigned Number: ${newVisit.opNumber}`);
  };

  const handleTriage = (e: React.FormEvent) => {
    e.preventDefault();
    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, vitals: vitalsInput, stage: 'Doctor (SOAP)' } : v));
    alert('Vitals logged. Patient routed to Doctor Panel.');
  };

  const handleDoctorSOAP = (e: React.FormEvent) => {
    e.preventDefault();
    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, soap: soapInput, prescriptions: rxInput, stage: 'Pharmacy' } : v));
    alert('SOAP consultation committed. Routed to Pharmacy & Billing.');
  };

  const handleBilling = (visitId: string) => {
    setVisits(visits.map(v => v.id === visitId ? { ...v, paid: true, stage: 'Completed' } : v));
    alert('Payment confirmed. Visit closed.');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b0f19] border border-slate-800 p-4 rounded-2xl">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SONA-HIS Clinical Portal</h1>
            <p className="text-xs text-indigo-400">Data Protection & SOAP Standard Compliant</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['register', 'triage', 'doctor', 'pharmacy', 'billing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-[#111827] text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* 1. Registration Panel */}
        {activeTab === 'register' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest">1. Patient Registration & Intake</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                required
                type="text"
                placeholder="Full Patient Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#030712] border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
              <button type="submit" className="w-full py-3 bg-sky-600 hover:bg-sky-500 font-bold rounded-xl text-sm transition">
                Generate OP Number & Route to Triage
              </button>
            </form>
          </section>
        )}

        {/* 2. Triage Vitals Panel */}
        {activeTab === 'triage' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">2. Triage & Vital Signs</h2>
            <form onSubmit={handleTriage} className="space-y-4">
              <select 
                value={selectedVisitId} 
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#030712] border border-slate-700 text-sm text-white"
              >
                {visits.filter(v => v.stage === 'Triage' || v.stage === 'Registration').map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.opNumber})</option>
                ))}
              </select>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input placeholder="BP (e.g. 120/80)" value={vitalsInput.bp} onChange={e => setVitalsInput({...vitalsInput, bp: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="Temp (°C)" value={vitalsInput.temp} onChange={e => setVitalsInput({...vitalsInput, temp: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="Heart Rate" value={vitalsInput.hr} onChange={e => setVitalsInput({...vitalsInput, hr: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="Weight (kg)" value={vitalsInput.weight} onChange={e => setVitalsInput({...vitalsInput, weight: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-sm transition">
                Commit Vitals & Forward to Doctor
              </button>
            </form>
          </section>
        )}

        {/* 3. Doctor Consultation (SOAP Standard) */}
        {activeTab === 'doctor' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest">3. Doctor Clinical Panel (SOAP Framework)</h2>
            <form onSubmit={handleDoctorSOAP} className="space-y-4">
              <select 
                value={selectedVisitId} 
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#030712] border border-slate-700 text-sm text-white"
              >
                {visits.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.opNumber}) - Stage: {v.stage}</option>
                ))}
              </select>
              <textarea placeholder="Subjective (S): Chief complaints & patient history..." value={soapInput.subjective} onChange={e => setSoapInput({...soapInput, subjective: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" />
              <textarea placeholder="Objective (O): Vitals & physical findings..." value={soapInput.objective} onChange={e => setSoapInput({...soapInput, objective: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" />
              <input placeholder="Assessment (A): Primary diagnosis / ICD code..." value={soapInput.assessment} onChange={e => setSoapInput({...soapInput, assessment: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
              <textarea placeholder="Plan (P): Treatment plan & instructions..." value={soapInput.plan} onChange={e => setSoapInput({...soapInput, plan: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" />
              <input placeholder="Prescriptions / Rx Orders" value={rxInput} onChange={e => setRxInput(e.target.value)} className="w-full p-3 bg-[#030712] border border-purple-500/30 rounded-xl text-xs text-purple-300" />
              <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-sm transition">
                Save SOAP Entry & Route to Pharmacy
              </button>
            </form>
          </section>
        )}

        {/* 4. Pharmacy & Dispensing */}
        {activeTab === 'pharmacy' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest">4. Pharmacy Orders</h2>
            <div className="space-y-3">
              {visits.map(v => (
                <div key={v.id} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white text-sm">{v.name} ({v.opNumber})</span>
                    <p className="text-xs text-amber-300 mt-1">Rx: {v.prescriptions || 'No medication ordered'}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                    {v.stage}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Billing & Revenue Counter */}
        {activeTab === 'billing' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">5. Billing & Payment Queue</h2>
            <div className="space-y-3">
              {visits.map(v => (
                <div key={v.id} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white text-sm">{v.name} ({v.opNumber})</span>
                    <p className="text-xs text-slate-400 mt-1">Bill Amount: KES {v.billingAmount || 0}</p>
                  </div>
                  {v.paid ? (
                    <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-semibold">
                      Paid & Cleared
                    </span>
                  ) : (
                    <button onClick={() => handleBilling(v.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white transition">
                      Confirm Payment
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}