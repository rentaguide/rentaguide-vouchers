
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Voucher, ViewMode, AppState } from './types';
import { 
  loadState, 
  saveVoucher, 
  deleteVoucherFromDb, 
  updateListItem, 
  updateNextVoucherNumber,
  saveSessionState,
  loadSessionState
} from './services/storageService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VoucherForm from './components/VoucherForm';
import VoucherPrintout from './components/VoucherPrintout';
import ManageLists from './components/ManageLists';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewMode>('dashboard');
  const [activeVoucherId, setActiveVoucherId] = useState<number | null>(null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Voucher Saved!');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const data = await loadState();
      const session = loadSessionState();
      setState(data);
      if (session) {
        setView(session.lastView || 'dashboard');
        setActiveVoucherId(session.lastActiveVoucherId || null);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveSessionState(view, activeVoucherId);
    }
  }, [view, activeVoucherId, loading]);

  const activeVoucher = useMemo(() => {
    if (!activeVoucherId || !state) return null;
    return state.vouchers.find(v => v.id === activeVoucherId) || null;
  }, [state, activeVoucherId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmitVoucher = useCallback(async (
    formData: Omit<Voucher, 'id' | 'createdAt'>, 
    isNewService: boolean,
    isNewSupplier: boolean
  ) => {
    if (!state) return;
    
    const isEdit = view === 'edit' && activeVoucherId;
    const existingVoucher = isEdit ? state.vouchers.find(v => v.id === activeVoucherId) : null;
    
    const voucherToSave: Voucher = existingVoucher 
      ? { ...existingVoucher, ...formData }
      : { ...formData, id: Date.now(), createdAt: new Date().toISOString() };

    try {
      await saveVoucher(voucherToSave, state);
      if (isNewService) await updateListItem('service', formData.serviceType, 'add', state);
      if (isNewSupplier) await updateListItem('supplier', formData.to, 'add', state);
      if (!existingVoucher) await updateNextVoucherNumber(state.nextVoucherNumber + 1, state);

      setState(prev => {
        if (!prev) return prev;
        const isExisting = prev.vouchers.some(v => v.id === voucherToSave.id);
        const updatedVouchers = isExisting
          ? prev.vouchers.map(v => v.id === voucherToSave.id ? voucherToSave : v)
          : [voucherToSave, ...prev.vouchers];

        return {
          ...prev,
          vouchers: updatedVouchers,
          services: isNewService ? [...prev.services, formData.serviceType].sort() : prev.services,
          suppliers: isNewSupplier ? [...prev.suppliers, formData.to].sort() : prev.suppliers,
          nextVoucherNumber: isExisting ? prev.nextVoucherNumber : prev.nextVoucherNumber + 1
        };
      });

      setActiveVoucherId(voucherToSave.id);
      setView('preview');
      triggerToast(existingVoucher ? 'Voucher Updated!' : 'Voucher Generated!');
    } catch (err) {
      console.error("Save failed", err);
    }
  }, [view, activeVoucherId, state]);

  const handleDeleteVoucher = async (id: number) => {
    if (state && confirm("Are you sure you want to delete this voucher?")) {
      await deleteVoucherFromDb(id, state);
      setState(prev => prev ? ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }) : prev);
      triggerToast('Voucher Deleted');
    }
  };

  const handleDuplicateVoucher = async (voucher: Voucher) => {
    if (!state) return;
    const newVoucher: Voucher = {
      ...voucher,
      id: Date.now(),
      voucherNumber: state.nextVoucherNumber,
      createdAt: new Date().toISOString(),
      dateOfService: new Date().toISOString().split('T')[0]
    };

    await saveVoucher(newVoucher, state);
    await updateNextVoucherNumber(state.nextVoucherNumber + 1, state);
    
    setState(prev => prev ? ({
      ...prev,
      vouchers: [newVoucher, ...prev.vouchers],
      nextVoucherNumber: prev.nextVoucherNumber + 1
    }) : prev);

    setActiveVoucherId(newVoucher.id);
    setView('edit');
    triggerToast('Voucher Duplicated');
  };

  const handleListItemAction = async (type: 'guides' | 'suppliers' | 'services', action: 'add' | 'delete' | 'update', name: string, oldName?: string) => {
    if (!state) return;
    const dbType = type === 'guides' ? 'guide' : type === 'suppliers' ? 'supplier' : 'service';
    await updateListItem(dbType, name, action, state, oldName);
    setState(prev => {
      if (!prev) return prev;
      let newList = [...prev[type]];
      if (action === 'add') newList = [...newList, name].sort();
      if (action === 'delete') newList = newList.filter(i => i !== name);
      if (action === 'update' && oldName) newList = newList.map(i => i === oldName ? name : i).sort();
      return { ...prev, [type]: newList };
    });
    triggerToast('List Updated');
  };

  const handlePrint = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!activeVoucher || isGenerating) return;
    setIsGenerating(true);
    const element = document.getElementById('voucher-document');
    if (element) {
      const opt = {
        margin: 0,
        filename: `Voucher_${activeVoucher.voucherNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    }
    setIsGenerating(false);
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-white rounded-full animate-spin mb-8"></div>
        <h2 className="text-white text-3xl font-black mb-2 tracking-tight">Syncing System...</h2>
      </div>
    );
  }

  return (
    <Layout activeView={view} onViewChange={(v) => {
      if (v === 'dashboard') { setActiveVoucherId(null); setView('dashboard'); }
      else if (v === 'create') { setActiveVoucherId(null); setView('create'); }
      else setView(v);
    }}>
      {showToast && (
        <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce">
          <p className="font-bold">{toastMessage}</p>
        </div>
      )}

      {view === 'dashboard' && (
        <Dashboard 
          vouchers={state.vouchers} 
          onViewVoucher={(v) => { setActiveVoucherId(v.id); setView('preview'); }} 
          onEditVoucher={(v) => { setActiveVoucherId(v.id); setView('edit'); }}
          onDeleteVoucher={handleDeleteVoucher}
          onDuplicateVoucher={handleDuplicateVoucher}
          onCreateNew={() => { setActiveVoucherId(null); setView('create'); }} 
        />
      )}

      {(view === 'create' || view === 'edit') && (
        <VoucherForm 
          voucherNumber={state.nextVoucherNumber} 
          availableServices={state.services}
          availableSuppliers={state.suppliers}
          availableGuides={state.guides || []}
          initialData={view === 'edit' ? activeVoucher || undefined : undefined}
          onSubmit={handleSubmitVoucher}
          onCancel={() => setView('dashboard')}
        />
      )}

      {view === 'manage' && (
        <ManageLists 
          guides={state.guides}
          suppliers={state.suppliers}
          services={state.services}
          onDeleteGuide={(n) => handleListItemAction('guides', 'delete', n)}
          onDeleteSupplier={(n) => handleListItemAction('suppliers', 'delete', n)}
          onDeleteService={(n) => handleListItemAction('services', 'delete', n)}
          onAddItem={(t, n) => handleListItemAction(t, 'add', n)}
          onEditItem={(t, o, n) => handleListItemAction(t, 'update', n, o)}
        />
      )}

      {view === 'preview' && activeVoucher && (
        <div className="max-w-[850px] mx-auto space-y-6 pb-20 relative">
          <div className="no-print sticky top-4 z-[9999] flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-2xl">
            <button onClick={() => setView('dashboard')} className="flex items-center space-x-2 text-slate-600 font-bold px-4 py-2 bg-slate-50 rounded-xl">
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <button onClick={() => setView('edit')} className="px-6 py-2 bg-white text-slate-700 rounded-xl font-bold border border-slate-200">Edit</button>
              <button onClick={handlePrint} disabled={isGenerating} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-black shadow-lg">
                {isGenerating ? 'GEN...' : 'DOWNLOAD PDF'}
              </button>
            </div>
          </div>
          <div className="bg-slate-200 p-1 md:p-8 rounded-3xl shadow-inner border border-slate-300">
             <VoucherPrintout voucher={activeVoucher} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
