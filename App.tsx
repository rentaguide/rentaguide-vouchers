
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Voucher, ViewMode, AppState } from './types';
import { loadState, saveState } from './services/storageService';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VoucherForm from './components/VoucherForm';
import VoucherPrintout from './components/VoucherPrintout';
import ManageLists from './components/ManageLists';

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const App: React.FC = () => {
  const initialState = useMemo(() => loadState(), []);
  const [state, setState] = useState<AppState>(initialState);
  
  // Hydrate view and active voucher from saved state
  const [view, setView] = useState<ViewMode>(initialState.lastView || 'dashboard');
  const [activeVoucherId, setActiveVoucherId] = useState<number | null>(initialState.lastActiveVoucherId || null);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Voucher Saved!');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveState({
      ...state,
      lastView: view,
      lastActiveVoucherId: activeVoucherId
    });
  }, [state, view, activeVoucherId]);

  const activeVoucher = useMemo(() => {
    if (!activeVoucherId) return null;
    return state.vouchers.find(v => v.id === activeVoucherId) || null;
  }, [state.vouchers, activeVoucherId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmitVoucher = useCallback((
    formData: Omit<Voucher, 'id' | 'createdAt'>, 
    isNewService: boolean,
    isNewSupplier: boolean
  ) => {
    const isEdit = view === 'edit' && activeVoucherId;
    const existingVoucher = isEdit ? state.vouchers.find(v => v.id === activeVoucherId) : null;
    
    const voucherToSave: Voucher = existingVoucher 
      ? { ...existingVoucher, ...formData }
      : { ...formData, id: Date.now(), createdAt: new Date().toISOString() };

    setState(prev => {
      let updatedServices = prev.services;
      if (isNewService && !prev.services.includes(formData.serviceType)) {
        updatedServices = [...prev.services, formData.serviceType].sort();
      }
      let updatedSuppliers = prev.suppliers;
      if (isNewSupplier && !prev.suppliers.includes(formData.to)) {
        updatedSuppliers = [...prev.suppliers, formData.to].sort();
      }
      let updatedGuides = prev.guides || [];
      if (formData.guideName && !updatedGuides.includes(formData.guideName)) {
        updatedGuides = [...updatedGuides, formData.guideName].sort();
      }

      const isExisting = prev.vouchers.some(v => v.id === voucherToSave.id);
      const updatedVouchers = isExisting
        ? prev.vouchers.map(v => v.id === voucherToSave.id ? voucherToSave : v)
        : [voucherToSave, ...prev.vouchers];

      return {
        ...prev,
        vouchers: updatedVouchers,
        services: updatedServices,
        suppliers: updatedSuppliers,
        guides: updatedGuides,
        nextVoucherNumber: isExisting ? prev.nextVoucherNumber : prev.nextVoucherNumber + 1
      };
    });

    setActiveVoucherId(voucherToSave.id);
    setView('preview');
    triggerToast(existingVoucher ? 'Voucher Updated!' : 'Voucher Generated!');
  }, [view, activeVoucherId, state.vouchers]);

  const handleDeleteVoucher = (id: number) => {
    if (confirm("Are you sure you want to delete this voucher? This action cannot be undone.")) {
      setState(prev => ({
        ...prev,
        vouchers: prev.vouchers.filter(v => v.id !== id)
      }));
      triggerToast('Voucher Deleted');
    }
  };

  const handleDuplicateVoucher = (voucher: Voucher) => {
    const newVoucher: Voucher = {
      ...voucher,
      id: Date.now(),
      voucherNumber: state.nextVoucherNumber,
      createdAt: new Date().toISOString(),
      dateOfService: new Date().toISOString().split('T')[0]
    };

    setState(prev => ({
      ...prev,
      vouchers: [newVoucher, ...prev.vouchers],
      nextVoucherNumber: prev.nextVoucherNumber + 1
    }));

    setActiveVoucherId(newVoucher.id);
    setView('edit');
    triggerToast('Voucher Duplicated');
  };

  const handleDeleteGuide = (name: string) => {
    setState(prev => ({ ...prev, guides: prev.guides.filter(g => g !== name) }));
    triggerToast('Guide Removed');
  };

  const handleDeleteSupplier = (name: string) => {
    setState(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s !== name) }));
    triggerToast('Supplier Removed');
  };

  const handleDeleteService = (name: string) => {
    setState(prev => ({ ...prev, services: prev.services.filter(s => s !== name) }));
    triggerToast('Service Removed');
  };

  const handleAddItem = (type: 'guides' | 'suppliers' | 'services', name: string) => {
    setState(prev => {
      const list = prev[type] || [];
      if (list.includes(name)) return prev;
      return { ...prev, [type]: [...list, name].sort() };
    });
    triggerToast('Item Added');
  };

  const handleEditItem = (type: 'guides' | 'suppliers' | 'services', oldName: string, newName: string) => {
    setState(prev => {
      const list = prev[type] || [];
      return {
        ...prev,
        [type]: list.map(item => item === oldName ? newName : item).sort()
      };
    });
    triggerToast('Item Updated');
  };

  const handlePrint = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!activeVoucher || isGenerating) return;

    setIsGenerating(true);
    const element = document.getElementById('voucher-document');
    if (!element) {
      setIsGenerating(false);
      return;
    }

    const opt = {
      margin:       0,
      filename:     `Voucher_${activeVoucher.voucherNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateToDashboard = () => {
    setActiveVoucherId(null);
    setView('dashboard');
  };

  return (
    <Layout activeView={view} onViewChange={(v) => {
      if (v === 'dashboard') navigateToDashboard();
      if (v === 'create') { setActiveVoucherId(null); setView('create'); }
      if (v === 'manage') setView('manage');
    }}>
      {showToast && (
        <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border-2 border-white/20 animate-bounce">
          <i className="fas fa-check-circle text-2xl"></i>
          <div>
            <p className="font-bold">{toastMessage}</p>
          </div>
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
          onCancel={navigateToDashboard}
        />
      )}

      {view === 'manage' && (
        <ManageLists 
          guides={state.guides}
          suppliers={state.suppliers}
          services={state.services}
          onDeleteGuide={handleDeleteGuide}
          onDeleteSupplier={handleDeleteSupplier}
          onDeleteService={handleDeleteService}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
        />
      )}

      {view === 'preview' && activeVoucher && (
        <div className="max-w-[850px] mx-auto space-y-6 pb-20 relative">
          <div className="no-print sticky top-4 z-[9999] flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-2xl">
            <button 
              onClick={(e) => { e.preventDefault(); navigateToDashboard(); }}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-bold px-4 py-2 bg-slate-50 rounded-xl transition-all"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={(e) => { e.preventDefault(); setView('edit'); }}
                disabled={isGenerating}
                className="px-6 py-2 bg-white text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm disabled:opacity-50"
              >
                Edit
              </button>
              <button 
                onClick={handlePrint} 
                disabled={isGenerating}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-black flex items-center justify-center space-x-3 shadow-lg transition-all min-w-[200px] ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>GENERATING...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-download text-xl"></i>
                    <span>DOWNLOAD PDF</span>
                  </>
                )}
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
