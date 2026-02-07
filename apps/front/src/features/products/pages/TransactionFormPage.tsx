import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionService } from '../services/transaction.service';

export const TransactionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      await transactionService.createTransaction(id, {
        description: formData.description,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString()
      });
      navigate(`/products/${id}/transactions`);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la transacción. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Nueva Transacción</h2>
      
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            id="description"
            required
            placeholder="Ej: Nómina, Pago alquiler..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            required
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={() => navigate(`/products/${id}/transactions`)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Volver</button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
};