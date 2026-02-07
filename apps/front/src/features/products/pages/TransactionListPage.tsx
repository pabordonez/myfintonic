import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { transactionService } from '../services/transaction.service';
import { ProductWithTransactions } from '../types/transaction.types';

export const TransactionListPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithTransactions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      transactionService.getProductDetails(id)
        .then(setProduct)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const currencyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center text-gray-500">Cargando transacciones...</div>;
    if (!product) return <div className="p-8 text-center text-red-600">Producto no encontrado</div>;

    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
            <p className="text-gray-500">{product.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/products/${id}`)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} /> Volver al Producto
            </button>
            <button
              onClick={() => navigate(`/products/${id}/transactions/new`)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Nueva Transacción
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {product.transactions?.map((t, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {currencyFormatter.format(t.amount)}
                  </td>
                </tr>
              ))}
              {(!product.transactions || product.transactions.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <p>No hay transacciones registradas para este producto.</p>
                      <button
                        onClick={() => navigate(`/products/${id}/transactions/new`)}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} /> Crear Primera Transacción
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return renderContent();
};