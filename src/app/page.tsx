'use client';
import { useState } from 'react';

type UserRole = 'Doctor' | 'Registration' | 'Triage' | 'Pharmacy' | 'Billing';

interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
}

interface BillableItem {
  id: string;
  description: string;
  amount: number;
}

interface PatientVisit {
  id: string;
  name: string;
  opNumber: string;
  dob: string;
  gender: string;
  phone: string;
  nextOfKin: NextOfKin;
  stage: 'Registration' | 'Triage' | 'Doctor' | 'Pharmacy' | 'Billing' | 'Completed';
  vitals?: { bp: string; temp: string; hr: string; spo2: string; weight: string };
  soap?: { subjective: string; objective: string; assessment: string; plan: string };
  prescriptions: string[];
  billableItems: BillableItem[];
  isPaid: boolean;
}

export default function HISMainPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('Doctor');
  const [activeTab, setActiveTab] = useState<'register' | 'triage' | 'doctor' | 'pharmacy' | 'billing'>('register');

  const presetServices: BillableItem[] = [
    { id: '1', description: 'General Doctor Consultation', amount: 1500 },
    { id: '2', description: 'Full Blood Count (Lab)', amount: 1200 },
    { id: '3', description: 'Urinalysis Test', amount: 500 },
    { id: '4', description: 'Paracetamol 500mg Pack', amount: 300 },
    { id: '5', description: 'Amoxicillin 500mg Pack', amount: 800 },
  ];

  // Primary Visits State Queue
  const [visits, setVisits] = useState<PatientVisit[]>([
    {
      id: 'v1',
      name: 'Toni Braxton',
      opNumber: 'OP-2026-001',
      dob: '1992-05-14',
      gender: 'Female',
      phone: '+254712345678',
      nextOfKin: { name: 'Keri Hilson', relationship: 'Sister', phone: '+254787654321' },
      stage: 'Doctor',
      vitals: { bp: '120/80', temp: '36.8', hr: '72', spo2: '98', weight: '65' },
      soap: { subjective: 'Severe headaches and fever for 2 days', objective: 'Alert, febrile', assessment: 'Acute Malaria', plan: 'Prescribe antimalarials' },
      prescriptions: ['Coartem 80/480mg', 'Paracetamol 500mg'],
      billableItems: [
        { id: '1', description: 'General Doctor Consultation', amount: 1000 },
        { id: '4', description: 'Paracetamol 500mg Pack', amount: 300 },
      ],
      isPaid: false,
    }
  ]);

  const [selectedVisitId, setSelectedVisitId] = useState<string>('v1');

  // Interactive Form Inputs State
  const [regData, setRegData] = useState({ name: '', dob: '', gender: 'Male', phone: '', kinName: '', kinRelation: '', kinPhone: '' });
  const [vitalsInput, setVitalsInput] = useState({ bp: '', temp: '', hr: '', spo2: '', weight: '' });
  const [soapInput, setSoapInput] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [newPrescription, setNewPrescription] = useState('');

  const currentPatient = visits.find(v => v.id === selectedVisitId) || visits[0];

  const canEdit = (requiredRole: UserRole) => activeRole === 'Doctor' || activeRole === requiredRole;

  // 1. Dynamic Patient Registration Handler
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit('Registration')) return alert('Access Denied: Switch role to Registration or Doctor.');

    const newVisit: PatientVisit = {
      id: Date.now().toString(),
      name: regData.name,
      opNumber: `OP-2026-00${visits.length + 1}`,
      dob: regData.dob,
      gender: regData.gender,
      phone: regData.phone,
      nextOfKin: { name: regData.kinName, relationship: regData.kinRelation, phone: regData.kinPhone },
      stage: 'Triage',
      prescriptions: [],
      billableItems: [],
      isPaid: false,
    };

    setVisits([newVisit, ...visits]);
    setSelectedVisitId(newVisit.id);
    setRegData({ name: '', dob: '', gender: 'Male', phone: '', kinName: '', kinRelation: '', kinPhone: '' });
    setActiveTab('triage');
    alert(`Registered ${newVisit.name}! Assigned OP: ${newVisit.opNumber}`);
  };

  // 2. Vitals Update Handler
  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit('Triage')) return alert('Access Denied: Switch role to Triage or Doctor.');

    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, vitals: { ...vitalsInput }, stage: 'Doctor' } : v));
    setActiveTab('doctor');
    alert('Vitals updated successfully.');
  };

  // 3. SOAP Entry Handler
  const handleSoapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole !== 'Doctor') return alert('Access Denied: Only Doctors can write SOAP entries.');

    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, soap: { ...soapInput }, stage: 'Pharmacy' } : v));
    setActiveTab('pharmacy');
    alert('SOAP Consultation saved.');
  };

  // 4. Pharmacist & Doctor Prescription/Medicine Handler
  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit('Pharmacy')) return alert('Access Denied: Switch role to Pharmacy or Doctor.');
    if (!newPrescription.trim()) return;

    setVisits(visits.map(v => {
      if (v.id === selectedVisitId) {
        return {
          ...v,
          prescriptions: [...v.prescriptions, newPrescription],
          billableItems: [...v.billableItems, { id: Date.now().toString(), description: `Dispensed: ${newPrescription}`, amount: 450 }]
        };
      }
      return v;
    }));

    setNewPrescription('');
    alert('Medicine added to prescription list and billing invoice.');
  };

  const handleAddBillableItem = (item: BillableItem) => {
    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, billableItems: [...v.billableItems, item] } : v));
  };

  const calculateTotalBill = (items: BillableItem[]) => items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0b0f19] border-r border-slate-800 transition-all p-4 flex flex-col justify-between sticky top-0 h-screen`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="font-bold text-white tracking-tight">SONA-HIS</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-[#111827] border border-slate-800 rounded-xl text-xs">
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'register', label: '1. Registration' },
              { id: 'triage', label: '2. Triage & Vitals' },
              { id: 'doctor', label: '3. Doctor (SOAP)' },
              { id: 'pharmacy', label: '4. Pharmacy' },
              { id: 'billing', label: '5. Billing & Invoices' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold ${
                  activeTab === nav.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                {sidebarOpen && <span>{nav.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Role Switcher */}
        {sidebarOpen && (
          <div className="bg-[#030712] border border-slate-800 p-3 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Switch User Context</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="w-full p-2 bg-[#111827] border border-slate-700 rounded-lg text-xs font-semibold text-indigo-300"
            >
              <option value="Doctor">Doctor (Full Access)</option>
              <option value="Registration">Registration Clerk</option>
              <option value="Triage">Triage Nurse</option>
              <option value="Pharmacy">Pharmacist</option>
              <option value="Billing">Billing Officer</option>
            </select>
          </div>
        )}
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <header className="flex justify-between items-center bg-[#0b0f19] border border-slate-800 p-4 rounded-2xl">
          <div>
            <h2 className="text-base font-bold text-white">Active Operational Portal</h2>
            <p className="text-xs text-slate-400">Signed in as: <span className="text-indigo-400 font-semibold">{activeRole}</span></p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-semibold">Active Patient:</span>
            <select
              value={selectedVisitId}
              onChange={(e) => {
                setSelectedVisitId(e.target.value);
                const selected = visits.find(v => v.id === e.target.value);
                if (selected?.vitals) setVitalsInput(selected.vitals);
                if (selected?.soap) setSoapInput(selected.soap);
              }}
              className="p-2.5 bg-[#030712] border border-slate-700 rounded-xl text-xs text-white"
            >
              {visits.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.opNumber})</option>
              ))}
            </select>
          </div>
        </header>

        {/* Registration */}
        {activeTab === 'register' && (
          <section className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-sky-400 uppercase">1. Patient & Next of Kin Registration</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Full Patient Name" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input required type="date" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs text-slate-300" />
                <select value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input required placeholder="Phone Number" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase">Next of Kin Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input required placeholder="Kin Full Name" value={regData.kinName} onChange={e => setRegData({...regData, kinName: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                  <input required placeholder="Relationship (e.g. Spouse)" value={regData.kinRelation} onChange={e => setRegData({...regData, kinRelation: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                  <input required placeholder="Kin Phone Number" value={regData.kinPhone} onChange={e => setRegData({...regData, kinPhone: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 font-bold rounded-xl text-xs text-white">
                Register Patient & Generate OP Number
              </button>
            </form>
          </section>
        )}

        {/* Triage */}
        {activeTab === 'triage' && (
          <section className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-emerald-400 uppercase">2. Triage & Vitals ({currentPatient?.name})</h3>
            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <input placeholder="BP (120/80)" value={vitalsInput.bp} onChange={e => setVitalsInput({...vitalsInput, bp: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="Temp (°C)" value={vitalsInput.temp} onChange={e => setVitalsInput({...vitalsInput, temp: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="Pulse (BPM)" value={vitalsInput.hr} onChange={e => setVitalsInput({...vitalsInput, hr: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="SpO2 (%)" value={vitalsInput.spo2} onChange={e => setVitalsInput({...vitalsInput, spo2: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
                <input placeholder="Weight (kg)" value={vitalsInput.weight} onChange={e => setVitalsInput({...vitalsInput, weight: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
              </div>
              <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs text-white">
                Save Vitals & Send to Doctor
              </button>
            </form>
          </section>
        )}

        {/* Doctor SOAP */}
        {activeTab === 'doctor' && (
          <section className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-purple-400 uppercase">3. Doctor Consultation ({currentPatient?.name})</h3>
            <div className="bg-[#030712] border border-slate-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase">Quick Add Services</h4>
              <div className="flex flex-wrap gap-2">
                {presetServices.map((service) => (
                  <button key={service.id} type="button" onClick={() => handleAddBillableItem(service)} className="px-3 py-1.5 bg-[#111827] border border-indigo-500/30 text-xs text-slate-200 rounded-xl">
                    + {service.description} (KES {service.amount})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSoapSubmit} className="space-y-4">
              <textarea placeholder="Subjective (S)" value={soapInput.subjective} onChange={e => setSoapInput({...soapInput, subjective: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" />
              <textarea placeholder="Objective (O)" value={soapInput.objective} onChange={e => setSoapInput({...soapInput, objective: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" />
              <input placeholder="Assessment (A)" value={soapInput.assessment} onChange={e => setSoapInput({...soapInput, assessment: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" />
              <textarea placeholder="Plan (P)" value={soapInput.plan} onChange={e => setSoapInput({...soapInput, plan: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" />
              <button type="submit" className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-xs text-white">
                Save SOAP Notes & Forward
              </button>
            </form>
          </section>
        )}

        {/* Pharmacy (Pharmacist Allowed To Add Medicine) */}
        {activeTab === 'pharmacy' && (
          <section className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-amber-400 uppercase">4. Pharmacy Counter ({currentPatient?.name})</h3>

            <div className="p-4 bg-[#030712] border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Prescribed Medications:</h4>
              {currentPatient.prescriptions.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No medications added yet.</p>
              ) : (
                <ul className="list-disc pl-5 text-xs text-amber-300 space-y-1">
                  {currentPatient.prescriptions.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pharmacist Medicine Input Form */}
            <form onSubmit={handleAddMedicine} className="flex gap-3">
              <input
                required
                placeholder="Type drug name and dosage (e.g. Paracetamol 500mg t.d.s)"
                value={newPrescription}
                onChange={e => setNewPrescription(e.target.value)}
                className="flex-1 p-3 bg-[#030712] border border-amber-500/30 rounded-xl text-xs"
              />
              <button type="submit" className="px-5 py-3 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl text-xs text-white">
                + Add Drug to Patient Bill
              </button>
            </form>
          </section>
        )}

        {/* Billing */}
        {activeTab === 'billing' && (
          <section className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-emerald-400 uppercase">5. Patient Invoice ({currentPatient?.name})</h3>
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white">
                🖨️ Print Invoice
              </button>
            </div>

            <div className="p-6 bg-[#030712] border border-slate-800 rounded-2xl space-y-4">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-white text-sm">SONA-HIS INVOICE</span>
                <span className="text-xs text-slate-400 font-mono">OP: {currentPatient?.opNumber}</span>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentPatient.billableItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 text-slate-300">{item.description}</td>
                      <td className="py-2 text-right font-mono text-slate-200">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between border-t border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-400">TOTAL:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  KES {calculateTotalBill(currentPatient.billableItems).toFixed(2)}
                </span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}