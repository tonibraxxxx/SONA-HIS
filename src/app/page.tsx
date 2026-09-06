'use client';
import { useState } from 'react';

// Clinical Types & Role Definitions
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
  prescriptions?: string;
  billableItems: BillableItem[];
  isPaid: boolean;
}

export default function HISMainPortal() {
  // Navigation & Role Control State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('Doctor');
  const [activeTab, setActiveTab] = useState<'register' | 'triage' | 'doctor' | 'pharmacy' | 'billing'>('doctor');

  // Pre-configured Billable Items Catalog
  const presetServices: BillableItem[] = [
    { id: '1', description: 'General Doctor Consultation', amount: 1000 },
    { id: '2', description: 'Full Blood Count (Lab)', amount: 1200 },
    { id: '3', description: 'Urinalysis Test', amount: 500 },
    { id: '4', description: 'Paracetamol 500mg Pack', amount: 300 },
    { id: '5', description: 'Amoxicillin 500mg Pack', amount: 800 },
  ];

  // Active Visits Store
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
      soap: { subjective: 'Severe headaches and fever for 2 days', objective: 'Alert, febrile to touch', assessment: 'Acute Malaria', plan: 'Prescribed antimalarials & analgesics' },
      prescriptions: 'Coartem 80/480mg, Paracetamol 500mg',
      billableItems: [
        { id: '1', description: 'General Doctor Consultation', amount: 1000 },
        { id: '4', description: 'Paracetamol 500mg Pack', amount: 300 },
      ],
      isPaid: false,
    }
  ]);

  // Selected Patient for Workflow
  const [selectedVisitId, setSelectedVisitId] = useState<string>('v1');

  // Form Inputs
  const [regData, setRegData] = useState({ name: '', dob: '', gender: 'Male', phone: '', kinName: '', kinRelation: '', kinPhone: '' });
  const [vitalsInput, setVitalsInput] = useState({ bp: '', temp: '', hr: '', spo2: '', weight: '' });
  const [soapInput, setSoapInput] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [rxInput, setRxInput] = useState('');

  const currentPatient = visits.find(v => v.id === selectedVisitId) || visits[0];

  // Role Control Checker: Doctors hold full override permissions
  const canEdit = (requiredRole: UserRole) => activeRole === 'Doctor' || activeRole === requiredRole;

  // Handlers
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit('Registration')) return alert('Access Denied: Switch to Registration or Doctor role.');
    
    const newVisit: PatientVisit = {
      id: Date.now().toString(),
      name: regData.name,
      opNumber: `OP-2026-00${visits.length + 1}`,
      dob: regData.dob,
      gender: regData.gender,
      phone: regData.phone,
      nextOfKin: { name: regData.kinName, relationship: regData.kinRelation, phone: regData.kinPhone },
      stage: 'Triage',
      billableItems: [],
      isPaid: false,
    };

    setVisits([newVisit, ...visits]);
    setSelectedVisitId(newVisit.id);
    setRegData({ name: '', dob: '', gender: 'Male', phone: '', kinName: '', kinRelation: '', kinPhone: '' });
    alert(`Patient Registered Successfully! OP Number: ${newVisit.opNumber}`);
  };

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit('Triage')) return alert('Access Denied: Switch to Triage or Doctor role.');

    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, vitals: vitalsInput, stage: 'Doctor' } : v));
    alert('Vitals logged. Patient pushed to Doctor panel.');
  };

  const handleSoapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit('Doctor')) return alert('Access Denied: Only Doctors can write SOAP clinical entries.');

    setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, soap: soapInput, prescriptions: rxInput, stage: 'Pharmacy' } : v));
    alert('SOAP consultation & prescription saved.');
  };

  const handleAddBillableItem = (item: BillableItem) => {
    if (!canEdit('Billing') && activeRole !== 'Doctor' && activeRole !== 'Pharmacy') {
      return alert('Access Denied: Permission required to attach billable items.');
    }

    setVisits(visits.map(v => {
      if (v.id === selectedVisitId) {
        return { ...v, billableItems: [...v.billableItems, item] };
      }
      return v;
    }));
  };

  const handleConfirmPayment = (visitId: string) => {
    if (!canEdit('Billing')) return alert('Access Denied: Switch to Billing or Doctor role.');
    setVisits(visits.map(v => v.id === visitId ? { ...v, isPaid: true, stage: 'Completed' } : v));
    alert('Invoice Paid & Cleared.');
  };

  const calculateTotalBill = (items: BillableItem[]) => items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Collapsible Left Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0b0f19] border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between p-4 z-40 sticky top-0 h-screen`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="font-extrabold text-lg text-white tracking-tight">SONA-HIS</h1>
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Clinical Enterprise</p>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-[#111827] border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Active Navigation Tabs */}
          <nav className="space-y-2">
            {[
              { id: 'register', label: '1. Registration', roleRequired: 'Registration' },
              { id: 'triage', label: '2. Triage & Vitals', roleRequired: 'Triage' },
              { id: 'doctor', label: '3. Doctor (SOAP)', roleRequired: 'Doctor' },
              { id: 'pharmacy', label: '4. Pharmacy', roleRequired: 'Pharmacy' },
              { id: 'billing', label: '5. Billing & Invoices', roleRequired: 'Billing' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as any)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold transition ${
                  activeTab === nav.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                {sidebarOpen && <span>{nav.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Role Access Control Switcher */}
        {sidebarOpen && (
          <div className="bg-[#030712] border border-slate-800 rounded-2xl p-3 space-y-2">
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

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Top Bar with Role & Status Indicator */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b0f19] border border-slate-800 p-4 rounded-2xl">
          <div>
            <h2 className="text-base font-bold text-white">Active Operational Portal</h2>
            <p className="text-xs text-slate-400">Signed in as: <span className="text-indigo-400 font-semibold">{activeRole}</span> {activeRole === 'Doctor' && '(Superuser Rights Enabled)'}</p>
          </div>

          {/* Global Active Patient Selector */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Patient:</span>
            <select
              value={selectedVisitId}
              onChange={(e) => setSelectedVisitId(e.target.value)}
              className="p-2.5 bg-[#030712] border border-slate-700 rounded-xl text-xs text-white font-mono"
            >
              {visits.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.opNumber}) - Stage: {v.stage}</option>
              ))}
            </select>
          </div>
        </header>

        {/* 1. Registration Panel with Next of Kin */}
        {activeTab === 'register' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-widest">1. Patient & Next of Kin Intake</h3>
              {!canEdit('Registration') && (
                <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg">Read-Only Mode</span>
              )}
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Full Patient Name" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Registration')} />
                <input required type="date" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs text-slate-300" disabled={!canEdit('Registration')} />
                <select value={regData.gender} onChange={e => setRegData({...regData, gender: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Registration')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input required placeholder="Phone Number" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Registration')} />
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase">Next of Kin Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input required placeholder="Kin Full Name" value={regData.kinName} onChange={e => setRegData({...regData, kinName: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Registration')} />
                  <input required placeholder="Relationship (e.g. Spouse)" value={regData.kinRelation} onChange={e => setRegData({...regData, kinRelation: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Registration')} />
                  <input required placeholder="Kin Phone Number" value={regData.kinPhone} onChange={e => setRegData({...regData, kinPhone: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Registration')} />
                </div>
              </div>

              {canEdit('Registration') && (
                <button type="submit" className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 font-bold rounded-xl text-xs text-white transition">
                  Register Patient & Assign OP Number
                </button>
              )}
            </form>
          </section>
        )}

        {/* 2. Triage Panel */}
        {activeTab === 'triage' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">2. Triage & Vital Signs Entry</h3>
              {!canEdit('Triage') && <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg">Read-Only Mode</span>}
            </div>

            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <input placeholder="BP (e.g. 120/80)" value={vitalsInput.bp} onChange={e => setVitalsInput({...vitalsInput, bp: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Triage')} />
                <input placeholder="Temp (°C)" value={vitalsInput.temp} onChange={e => setVitalsInput({...vitalsInput, temp: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Triage')} />
                <input placeholder="Pulse (BPM)" value={vitalsInput.hr} onChange={e => setVitalsInput({...vitalsInput, hr: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Triage')} />
                <input placeholder="SpO2 (%)" value={vitalsInput.spo2} onChange={e => setVitalsInput({...vitalsInput, spo2: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Triage')} />
                <input placeholder="Weight (kg)" value={vitalsInput.weight} onChange={e => setVitalsInput({...vitalsInput, weight: e.target.value})} className="p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={!canEdit('Triage')} />
              </div>

              {canEdit('Triage') && (
                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs text-white transition">
                  Commit Vitals & Forward to Doctor
                </button>
              )}
            </form>
          </section>
        )}

        {/* 3. Doctor SOAP Panel & Quick Billable Items */}
        {activeTab === 'doctor' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest">3. Doctor Consultation (SOAP Standard)</h3>
              {activeRole !== 'Doctor' && <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg">Doctor Permissions Required To Edit</span>}
            </div>

            {/* Quick-Save Billable Services Catalog */}
            <div className="bg-[#030712] border border-slate-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase">Attach Billable Services (Saves Billing Time)</h4>
              <div className="flex flex-wrap gap-2">
                {presetServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleAddBillableItem(service)}
                    className="px-3 py-1.5 bg-[#111827] border border-indigo-500/30 hover:border-indigo-500 text-xs text-slate-200 rounded-xl transition"
                  >
                    + {service.description} (KES {service.amount})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSoapSubmit} className="space-y-4">
              <textarea placeholder="Subjective (S): Patient history..." value={soapInput.subjective} onChange={e => setSoapInput({...soapInput, subjective: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" disabled={activeRole !== 'Doctor'} />
              <textarea placeholder="Objective (O): Vitals & physical findings..." value={soapInput.objective} onChange={e => setSoapInput({...soapInput, objective: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" disabled={activeRole !== 'Doctor'} />
              <input placeholder="Assessment (A): Primary diagnosis..." value={soapInput.assessment} onChange={e => setSoapInput({...soapInput, assessment: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs" disabled={activeRole !== 'Doctor'} />
              <textarea placeholder="Plan (P): Treatment & follow-up..." value={soapInput.plan} onChange={e => setSoapInput({...soapInput, plan: e.target.value})} className="w-full p-3 bg-[#030712] border border-slate-700 rounded-xl text-xs h-16" disabled={activeRole !== 'Doctor'} />
              <input placeholder="Prescriptions / Electronic Orders" value={rxInput} onChange={e => setRxInput(e.target.value)} className="w-full p-3 bg-[#030712] border border-purple-500/30 rounded-xl text-xs text-purple-300" disabled={activeRole !== 'Doctor'} />

              {activeRole === 'Doctor' && (
                <button type="submit" className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-xs text-white transition">
                  Commit SOAP Notes & Route to Pharmacy
                </button>
              )}
            </form>
          </section>
        )}

        {/* 4. Pharmacy Module */}
        {activeTab === 'pharmacy' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">4. Pharmacy Prescriptions Queue</h3>
            <div className="p-4 bg-[#030712] border border-slate-800 rounded-2xl">
              <span className="font-bold text-white text-sm">{currentPatient.name} ({currentPatient.opNumber})</span>
              <p className="text-xs text-amber-300 mt-2 font-mono">Prescription: {currentPatient.prescriptions || 'No pending electronic orders.'}</p>
            </div>
          </section>
        )}

        {/* 5. Billing & Invoice Generator */}
        {activeTab === 'billing' && (
          <section className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl p-6 space-y-6 print:bg-white print:text-black">
            <div className="flex justify-between items-center print:hidden">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">5. Billing Counter & Automated Invoicing</h3>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white transition"
              >
                🖨️ Print / Download Invoice PDF
              </button>
            </div>

            {/* Generated Official Medical Invoice Structure */}
            <div className="p-6 bg-[#030712] border border-slate-800 rounded-2xl space-y-6">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white">SONA-HIS CLINIC</h4>
                  <p className="text-xs text-slate-400">Medical Service Invoice</p>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Invoice #: INV-{currentPatient.opNumber}</p>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 text-xs gap-2">
                <div>
                  <p className="text-slate-400">Patient Name: <span className="text-white font-semibold">{currentPatient.name}</span></p>
                  <p className="text-slate-400">OP Number: <span className="text-white font-mono">{currentPatient.opNumber}</span></p>
                </div>
                <div>
                  <p className="text-slate-400">Next of Kin: <span className="text-white font-semibold">{currentPatient.nextOfKin.name} ({currentPatient.nextOfKin.relationship})</span></p>
                  <p className="text-slate-400">Kin Phone: <span className="text-white font-mono">{currentPatient.nextOfKin.phone}</span></p>
                </div>
              </div>

              {/* Attached Billable Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentPatient.billableItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 text-slate-300">{item.description}</td>
                      <td className="py-2 text-right font-mono text-slate-200">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total & Action Bar */}
              <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                <span className="text-xs uppercase text-slate-400 font-bold">Total Payable:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  KES {calculateTotalBill(currentPatient.billableItems).toFixed(2)}
                </span>
              </div>

              {canEdit('Billing') && !currentPatient.isPaid && (
                <button
                  onClick={() => handleConfirmPayment(selectedVisitId)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs text-white transition print:hidden"
                >
                  Confirm Payment & Close Visit
                </button>
              )}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}