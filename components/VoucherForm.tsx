
import React, { useState } from 'react';
import { Voucher } from '../types';
import { ISRAEL_LOCATIONS } from '../constants';

interface VoucherFormProps {
  voucherNumber: number;
  availableServices: string[];
  availableSuppliers: string[];
  initialData?: Voucher;
  onSubmit: (data: Omit<Voucher, 'id' | 'createdAt'>, isNewService: boolean, isNewSupplier: boolean) => void;
  onCancel: () => void;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ 
  voucherNumber, 
  availableServices, 
  availableSuppliers,
  initialData,
  onSubmit, 
  onCancel 
}) => {
  // Merge system-saved suppliers with the static comprehensive Israel locations list
  const allSuppliers = Array.from(new Set([...availableSuppliers, ...ISRAEL_LOCATIONS])).sort();

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

  const isEditing = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalService = isAddingNewService ? customService : formData.serviceType;
    const finalSupplier = formData.to.trim();

    if (!finalService) {
      alert("Please select or enter a service type");
      return;
    }
    if (!finalSupplier) {
      alert("Please enter a supplier (TO)");
      return;
    }

    const isNewSupplier = !allSuppliers.includes(finalSupplier);

    onSubmit({
      ...formData,
      to: finalSupplier,
      serviceType: finalService,
    }, isAddingNewService, isNewSupplier);
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
            <label className="block text-sm font-medium text-slate-700">TO (Supplier / Hotel / Site):</label>
            <div className="relative">
              <input
                required
                list="suppliers-list"
                type="text"
                autoComplete="off"
                placeholder="Type hotel name or site..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              />
              <datalist id="suppliers-list">
                {allSuppliers.map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <div className="absolute right-3 top-2.5 text-slate-300 pointer-events-none">
                <i className="fas fa-search text-xs"></i>
              </div>
            </div>
          </div>

          {/* DATE & TIME Split Row */}
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">DATE OF SERVICE:</label>
              <input
                required
                type="date"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.dateOfService}
                onChange={(e) => setFormData({ ...formData, dateOfService: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">VISIT TIME:</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
              />
            </div>
          </div>

          {/* SERVICE Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">SERVICE:</label>
            {!isAddingNewService ? (
              <div className="flex gap-2">
                <select
                  required
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                  required
                  autoFocus
                  type="text"
                  placeholder="Enter new service name"
                  className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setIsAddingNewService(false)}
                  className="px-3 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg"
                  title="Select from existing"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            )}
          </div>

          {/* TOUR NUMBER Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">TOUR NUMBER:</label>
            <input
              required
              type="text"
              placeholder="e.g. TLV-2024-001"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.tourNumber}
              onChange={(e) => setFormData({ ...formData, tourNumber: e.target.value })}
            />
          </div>

          {/* NUMBER OF TRAVELERS Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">NUMBER OF TRAVELERS:</label>
            <input
              required
              type="number"
              min="1"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.numberOfTravelers}
              onChange={(e) => setFormData({ ...formData, numberOfTravelers: parseInt(e.target.value) })}
            />
          </div>

          {/* GUIDE NAME Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">GUIDE NAME:</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.guideName}
              onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
            />
          </div>
        </div>

        {/* SERVICE DESCRIPTION - Optional */}
        <div className="pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">SERVICE DESCRIPTION (Optional):</label>
            <textarea
              rows={4}
              placeholder="Describe the service in detail if needed..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
              value={formData.serviceDescription}
              onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
            ></textarea>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            {isEditing ? 'Update Voucher' : 'Generate Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherForm;
