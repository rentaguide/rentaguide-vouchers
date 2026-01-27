
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface ManageListsProps {
  guides: string[];
  suppliers: string[];
  services: string[];
  onDeleteGuide: (name: string) => void;
  onDeleteSupplier: (name: string) => void;
  onDeleteService: (name: string) => void;
  onAddItem: (type: 'guides' | 'suppliers' | 'services', name: string) => void;
  onEditItem: (type: 'guides' | 'suppliers' | 'services', oldName: string, newName: string) => void;
}

const ManageLists: React.FC<ManageListsProps> = ({ 
  guides, suppliers, services, 
  onDeleteGuide, onDeleteSupplier, onDeleteService,
  onAddItem, onEditItem
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'suppliers' | 'services' | 'setup'>('guides');
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    if (activeTab !== 'setup') {
      onAddItem(activeTab, newItemName.trim());
    }
    setNewItemName('');
  };

  const handleStartEdit = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const handleSaveEdit = (oldName: string) => {
    if (activeTab !== 'setup' && editValue.trim() && editValue !== oldName) {
      onEditItem(activeTab, oldName, editValue.trim());
    }
    setEditingItem(null);
  };

  const testConnection = async () => {
    if (!supabase) {
      setTestStatus('error');
      return;
    }
    setTestStatus('testing');
    try {
      const { data, error } = await supabase.from('vouchers').select('count', { count: 'exact', head: true });
      if (error) throw error;
      setTestStatus('success');
    } catch (err) {
      console.error(err);
      setTestStatus('error');
    }
  };

  const sqlCode = `-- Run this in your Supabase SQL Editor to create the necessary tables:

-- 1. Create Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
  id BIGINT PRIMARY KEY,
  voucherNumber INTEGER NOT NULL,
  "to" TEXT NOT NULL,
  serviceType TEXT NOT NULL,
  dateOfService DATE NOT NULL,
  visitTime TIME,
  tourNumber TEXT,
  numberOfTravelers INTEGER DEFAULT 1,
  serviceDescription TEXT,
  guideName TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create App Lists Table (for Services, Suppliers, Guides)
CREATE TABLE IF NOT EXISTS app_lists (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- 'service', 'supplier', or 'guide'
  name TEXT NOT NULL,
  UNIQUE(type, name)
);

-- 3. Create Config Table (for Voucher Sequence)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);

-- 4. Set initial voucher number
INSERT INTO app_config (key, value) 
VALUES ('next_voucher_number', 8000)
ON CONFLICT (key) DO NOTHING;`;

  const renderList = (items: string[], deleteFn: (item: string) => void, title: string) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">{title} ({items.length})</h3>
      </div>
      
      <form onSubmit={handleAdd} className="p-4 bg-blue-50/30 border-b border-slate-100 flex gap-2">
        <input 
          type="text" 
          placeholder={`Add new ${activeTab === 'setup' ? '' : activeTab.slice(0, -1)}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <i className="fas fa-plus"></i>
          <span>Add</span>
        </button>
      </form>

      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {items.length > 0 ? items.map((item, idx) => (
          <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
            {editingItem === item ? (
              <div className="flex-1 flex gap-2">
                <input 
                  autoFocus
                  className="flex-1 px-3 py-1 border-2 border-blue-500 rounded-lg outline-none font-semibold text-slate-700"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item)}
                />
                <button onClick={() => handleSaveEdit(item)} className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-xs">SAVE</button>
                <button onClick={() => setEditingItem(null)} className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs">CANCEL</button>
              </div>
            ) : (
              <>
                <span className="font-semibold text-slate-700">{item}</span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(item)} className="text-slate-400 hover:text-blue-600 p-2"><i className="fas fa-edit"></i></button>
                  <button onClick={() => confirm(`Delete "${item}"?`) && deleteFn(item)} className="text-slate-400 hover:text-red-500 p-2"><i className="fas fa-trash-alt"></i></button>
                </div>
              </>
            )}
          </div>
        )) : (
          <div className="p-10 text-center text-slate-400 italic">No entries found.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-slate-900">System Management</h1>
        <p className="text-slate-500">Configure lists and cloud database settings.</p>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-200 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('guides')} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'guides' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>Guides</button>
        <button onClick={() => setActiveTab('suppliers')} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>Suppliers</button>
        <button onClick={() => setActiveTab('services')} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'services' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>Services</button>
        <button onClick={() => setActiveTab('setup')} className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'setup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}>
          <i className="fas fa-cog mr-2"></i>Settings
        </button>
      </div>

      {activeTab === 'guides' && renderList(guides, onDeleteGuide, "Registered Guides")}
      {activeTab === 'suppliers' && renderList(suppliers, onDeleteSupplier, "Supplier Database")}
      {activeTab === 'services' && renderList(services, onDeleteService, "Service Types")}
      
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${testStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <i className={`fas ${testStatus === 'success' ? 'fa-check-double' : 'fa-cloud'}`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Connection Status</h3>
                  <p className="text-slate-500">Verify your cloud database connectivity.</p>
                </div>
              </div>
              <button 
                onClick={testConnection}
                disabled={testStatus === 'testing'}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center space-x-3 text-green-700">
                <i className="fas fa-check-circle text-xl"></i>
                <span className="font-bold">Database tables found! Your cloud sync is fully active.</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center space-x-3 text-red-700">
                <i className="fas fa-exclamation-triangle text-xl"></i>
                <span className="font-bold">Could not connect to tables. Please ensure you ran the SQL script in Supabase.</span>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xl">
                <i className="fas fa-code"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">SQL Reference</h3>
                <p className="text-slate-500">The script used to initialize your database.</p>
              </div>
            </div>

            <div className="relative group">
              <pre className="bg-slate-900 text-blue-300 p-6 rounded-xl overflow-x-auto text-sm font-mono border-4 border-slate-800 shadow-2xl">
                {sqlCode}
              </pre>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(sqlCode);
                  alert("SQL copied to clipboard!");
                }}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all backdrop-blur-sm"
              >
                <i className="fas fa-copy mr-2"></i>COPY CODE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLists;
