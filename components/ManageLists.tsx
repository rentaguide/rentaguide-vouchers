
import React, { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<'guides' | 'suppliers' | 'services'>('guides');
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(activeTab, newItemName.trim());
    setNewItemName('');
  };

  const handleStartEdit = (item: string) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const handleSaveEdit = (oldName: string) => {
    if (editValue.trim() && editValue !== oldName) {
      onEditItem(activeTab, oldName, editValue.trim());
    }
    setEditingItem(null);
  };

  const renderList = (items: string[], deleteFn: (item: string) => void, title: string) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">{title} ({items.length})</h3>
      </div>
      
      {/* Inline Add Form */}
      <form onSubmit={handleAdd} className="p-4 bg-blue-50/30 border-b border-slate-100 flex gap-2">
        <input 
          type="text" 
          placeholder={`Add new ${activeTab.slice(0, -1)}...`}
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
                <button 
                  onClick={() => handleSaveEdit(item)}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-xs"
                >
                  SAVE
                </button>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg font-bold text-xs"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <>
                <span className="font-semibold text-slate-700">{item}</span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleStartEdit(item)}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-2"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${item}"?`)) {
                        deleteFn(item);
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    title="Delete"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
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
        <h1 className="text-2xl font-black text-slate-900">Manage System Lists</h1>
        <p className="text-slate-500">Easily update guides, suppliers, and services used across the system.</p>
      </div>

      <div className="flex space-x-2 bg-slate-200 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => { setActiveTab('guides'); setEditingItem(null); }}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'guides' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
        >
          Guides
        </button>
        <button 
          onClick={() => { setActiveTab('suppliers'); setEditingItem(null); }}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
        >
          Suppliers
        </button>
        <button 
          onClick={() => { setActiveTab('services'); setEditingItem(null); }}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'services' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
        >
          Services
        </button>
      </div>

      {activeTab === 'guides' && renderList(guides, onDeleteGuide, "Registered Guides")}
      {activeTab === 'suppliers' && renderList(suppliers, onDeleteSupplier, "Supplier Database")}
      {activeTab === 'services' && renderList(services, onDeleteService, "Service Types")}
    </div>
  );
};

export default ManageLists;
