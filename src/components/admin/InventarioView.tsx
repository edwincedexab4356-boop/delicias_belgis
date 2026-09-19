import React, { useState, useMemo } from 'react';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  Search,
  Plus,
  AlertTriangle,
  History,
  Check,
  X,
  PackageCheck,
} from 'lucide-react';
import { Producto, MovimientoInventario, TipoMovimientoInventario, UserAuth } from '../../types';
import { inventarioService } from '../../services/inventarioService';
import { formatCurrency, formatFechaCorta } from '../../utils/formatters';

interface InventarioViewProps {
  productos: Producto[];
  movimientos: MovimientoInventario[];
  user: UserAuth;
  onRefreshData?: () => void;
}

export const InventarioView: React.FC<InventarioViewProps> = ({
  productos,
  movimientos,
  user,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'movimientos'>('stock');
  const [search, setSearch] = useState('');
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<Producto | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoInventario>('entrada');
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(1);
  const [motivoAjuste, setMotivoAjuste] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
    );
  }, [productos, search]);

  const handleOpenAdjustment = (prod: Producto, defaultType: TipoMovimientoInventario = 'entrada') => {
    setSelectedProductForAdjustment(prod);
    setTipoMovimiento(defaultType);
    setCantidadAjuste(1);
    setMotivoAjuste('');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjustment || cantidadAjuste <= 0) return;
    setLoading(true);

    try {
      await inventarioService.registrarMovimiento({
        productoId: selectedProductForAdjustment.id || '',
        productoNombre: selectedProductForAdjustment.nombre,
        tipo: tipoMovimiento,
        cantidad: cantidadAjuste,
        motivo: motivoAjuste.trim() || `Ajuste manual (${tipoMovimiento})`,
        usuario: user.displayName || user.email || 'Admin',
      });

      setSuccessMsg(`Inventario actualizado para ${selectedProductForAdjustment.nombre}`);
      setSelectedProductForAdjustment(null);
      onRefreshData?.();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Boxes className="w-7 h-7 text-amber-600" />
            <span>Control de Inventario en Tiempo Real</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Supervisa existencias, lotes críticos y bitácora completa de entradas y salidas.
          </p>
        </div>

        <div className="flex items-center p-1 bg-stone-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Existencias por Producto
          </button>
          <button
            onClick={() => setActiveTab('movimientos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'movimientos'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bitácora de Movimientos ({movimientos.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STOCK VIEW */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en inventario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-900/20"
            />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Precio Unitario</th>
                    <th className="p-3.5">Stock Mínimo</th>
                    <th className="p-3.5">Stock Actual</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((prod) => {
                    const currentStock = prod.stock ?? 0;
                    const minStock = prod.stockMinimo ?? 5;
                    const isLow = currentStock <= minStock && currentStock > 0;
                    const isZero = currentStock <= 0;

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5 font-medium text-stone-900">
                          {prod.nombre}
                        </td>
                        <td className="p-3.5 text-stone-500">{prod.categoria}</td>
                        <td className="p-3.5 font-serif font-bold text-stone-800">
                          {formatCurrency(prod.precio)}
                        </td>
                        <td className="p-3.5 text-stone-500">{minStock} uds.</td>
                        <td className="p-3.5">
                          <span
                            className={`font-mono text-sm font-bold ${
                              isZero
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {currentStock}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {isZero ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Agotado</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stock Bajo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" />
                              <span>Óptimo</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => handleOpenAdjustment(prod, 'entrada')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                            title="Entrada de stock"
                          >
                            + Entrada
                          </button>
                          <button
                            onClick={() => handleOpenAdjustment(prod, 'salida')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold transition-colors cursor-pointer"
                            title="Salida o merma"
                          >
                            - Salida
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOVEMENTS LOG VIEW */}
      {activeTab === 'movimientos' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Tipo</th>
                  <th className="p-3.5">Cantidad</th>
                  <th className="p-3.5">Motivo</th>
                  <th className="p-3.5">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No hay registros de movimientos en el inventario todavía.
                    </td>
                  </tr>
                ) : (
                  movimientos.map((mov) => {
                    const isEntrada = mov.tipo === 'entrada' || mov.tipo === 'produccion';
                    return (
                      <tr key={mov.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5 text-stone-400 whitespace-nowrap">
                          {formatFechaCorta(mov.createdAt || mov.fecha)}
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          {mov.productoNombre}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isEntrada
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isEntrada ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            <span>{mov.tipo}</span>
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          {isEntrada ? `+${mov.cantidad}` : `-${mov.cantidad}`} uds.
                        </td>
                        <td className="p-3.5 text-stone-700">{mov.motivo}</td>
                        <td className="p-3.5 text-stone-500">{mov.usuario || 'Sistema'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {selectedProductForAdjustment && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Ajustar Stock: {selectedProductForAdjustment.nombre}
              </h3>
              <button
                onClick={() => setSelectedProductForAdjustment(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Tipo de Movimiento
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTipoMovimiento('entrada')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      tipoMovimiento === 'entrada'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMovimiento('salida')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      tipoMovimiento === 'salida'
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    Salida (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMovimiento('merma')}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      tipoMovimiento === 'merma'
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    Merma (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Cantidad (Unidades)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadAjuste}
                  onChange={(e) => setCantidadAjuste(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Motivo o Justificación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ingreso de nuevo lote, merma por descongelación..."
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {loading ? 'Guardando...' : 'Aplicar Movimiento'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProductForAdjustment(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
