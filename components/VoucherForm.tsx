
import React, { useState } from 'react';
import { Voucher } from '../types';
import { ISRAEL_LOCATIONS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface VoucherFormProps {
  voucherNumber: number;
  availableServices: string[];
  availableSuppliers: string[];
  availableGuides: string[];
  initialData?: Voucher;
  onSubmit: (data: Omit<Voucher, 'id' | 'createdAt'>, isNewService: boolean, isNewSupplier: boolean) => void;
  onCancel: () => void;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ 
  voucherNumber, 
  availableServices, 
  availableSuppliers,
  availableGuides,
  initialData,
  onSubmit, 
  onCancel 
}) => {
  const allSuppliers = Array.from(new Set([...availableSuppliers, ...ISRAEL_LOCATIONS])).sort();
  const allGuides = Array.from(new Set(availableGuides)).sort();

  const [formData, setFormData] = useState({
    to: initialData?.to || '',
    serviceType: initialData?.serviceType || '',
    dateOfService: initialData?.dateOfService || '',
    visitTime: initialData?.visitTime || '',
    tourNumber: initialData?.tourNumber || '',
    numberOfTravelers: initialData?.numberOfTravelers || 1,
    serviceDescription: initialData?.serviceDescription || '',
    guideName: initialData?.guideName || '',
    voucherNumber: initialData?.voucherNumber || voucherNumber
  });

  const [customService, setCustomService] = useState('');
  const [isAddingNewService, setIsAddingNewService] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalService = isAddingNewService ? customService : formData.serviceType;
    const finalSupplier = formData.to.trim();

    const isNewSupplier = !allSuppliers.includes(finalSupplier);

    onSubmit({
      ...formData,
      to: finalSupplier,
      serviceType: finalService,
    }, isAddingNewService, isNewSupplier);
  };

  const handleAiMagic = async () => {
    if (!formData.to || !formData.serviceType) {
      alert("Please fill 'TO' and 'Service' fields first so AI knows the context.");
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const prompt = `Generate a short, professional 2-3 sentence itinerary description for a "${formData.serviceType}" at "${formData.to}" in Israel. Focus on professional tone for a travel work order. Include a placeholder for timing if relevant. NO MARKDOWN, JUST TEXT.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      if (response.text) {
        setFormData(prev => ({
          ...prev,
          serviceDescription: response.text.trim()
        }));
      }
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("Could not reach AI assistant. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">
          {isEditing ? `Edit Work Order / Voucher` : `New Work Order / Voucher`}
        </h2>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-mono">
          #{formData.voucherNumber}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TO (Supplier / Hotel / Site) */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">TO (Supplier / Hotel / Site):</label>
            <div className="relative">
              <input
                list="suppliers-list"
                type="text"
                autoComplete="off"
                placeholder="Type hotel name or site..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
              <datalist id="suppliers-list">
                {allSuppliers.map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <div className="absolute right-4 top-3.5 text-slate-300 pointer-events-none">
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>

          {/* DATE & TIME Split Row */}
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">DATE OF SERVICE:</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.dateOfService}
                onChange={(e) => setFormData({ ...formData, dateOfService: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">VISIT TIME:</label>
              <input
                type="time"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
              />
            </div>
          </div>

          {/* SERVICE Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">SERVICE:</label>
            {!isAddingNewService ? (
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                  value={formData.serviceType}
                  onChange={(e) => {
                    if (e.target.value === 'NEW') {
                      setIsAddingNewService(true);
                    } else {
                      setFormData({ ...formData, serviceType: e.target.value });
                    }
                  }}
                >
                  <option value="">Select Service</option>
                  {availableServices.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="NEW" className="text-blue-600 font-bold">+ Add New Service...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter new service name"
                  className="flex-1 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setIsAddingNewService(false)}
                  className="px-4 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* TOUR NUMBER Field renamed to ORDER NUMBER */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">ORDER NUMBER:</label>
            <input
              type="text"
              placeholder="e.g. TLV-2024-001"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.tourNumber}
              onChange={(e) => setFormData({ ...formData, tourNumber: e.target.value })}
            />
          </div>

          {/* NUMBER OF TRAVELERS Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">NUMBER OF TRAVELERS:</label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.numberOfTravelers}
              onChange={(e) => setFormData({ ...formData, numberOfTravelers: parseInt(e.target.value) || 0 })}
            />
          </div>

          {/* GUIDE NAME Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">GUIDE NAME:</label>
            <div className="relative">
              <input
                list="guides-list"
                type="text"
                autoComplete="off"
                placeholder="Name of the guide..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.guideName}
                onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
              />
              <datalist id="guides-list">
                {allGuides.map(g => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* SERVICE DESCRIPTION - Optional with AI Assist */}
        <div className="pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[11px] font-bold">SERVICE DESCRIPTION (Optional):</label>
              <button
                type="button"
                onClick={handleAiMagic}
                disabled={isAiLoading}
                className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-magic"></i>
                )}
                <span>AI ASSIST</span>
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Describe the service in detail if needed..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all leading-relaxed"
              value={formData.serviceDescription}
              onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
            ></textarea>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center space-x-3"
          >
            <i className={`fas ${isEditing ? 'fa-save' : 'fa-check-circle'}`}></i>
            <span>{isEditing ? 'Update Voucher' : 'Generate Voucher'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherForm;
