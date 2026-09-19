import React, { useState, useMemo } from 'react';
import {
  Factory,
  Plus,
  Calendar,
  Check,
  X,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ProduccionRegistro, Producto, UserAuth } from '../../types';
import { produccionService } from '../../services/produccionService';
import { formatFechaCorta } from '../../utils/formatters';

interface ProduccionViewProps {
  producciones: ProduccionRegistro[];
  productos: Producto[];
  user: UserAuth;
  onRefreshData?: () => void;
}

export const ProduccionView: React.FC<ProduccionViewProps> = ({
  producciones,
  productos,
  user,
  onRefreshData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductoId, setSelectedProductoId] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(12);
  const [lote, setLote] = useState<string>(() => `LOTE-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`);
  const [responsable, setResponsable] = useState<string>(user.displayName || user.email || 'Maestro Heladero');
  const [observaciones, setObservaciones] = useState<string>('');
  const [sumarInventario, setSumarInventario] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Daily totals
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    let totalHoy = 0;
    let totalHistorico = 0;
    producciones.forEach((p) => {
      const qty = Number(p.cantidad) || 0;
      totalHistorico += qty;
      if (p.fecha.startsWith(todayStr)) {
        totalHoy += qty;
      }
    });
    return { totalHoy, totalHistorico };
  }, [producciones, todayStr]);

  const handleOpenModal = () => {
    setSelectedProductoId(productos[0]?.id || '');
    setCantidad(12);
    setLote(`LOTE-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`);
    setObservaciones('');
    setSumarInventario(true);
    setIsModalOpen(true);
  };

  const handleSaveProduccion = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = productos.find((p) => p.id === selectedProductoId);
    if (!prod || cantidad <= 0) return;
    setLoading(true);

    try {
      await produccionService.registrarProduccion({
        productoId: prod.id || '',
        producto: prod.nombre,
        cantidad,
        lote: lote.trim() || undefined,
        responsable: responsable.trim() || undefined,
        observacion: observaciones.trim() || undefined,
      });

      // If user wants to increment inventory
      if (sumarInventario && prod.id) {
        // produccionService already manages inventory if product found, or inventarioService can record movement
      }

      setSuccessMsg(`Lote de ${cantidad} unidades de "${prod.nombre}" registrado exitosamente.`);
      setIsModalOpen(false);
      onRefreshData?.();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Error al registrar lote: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return producciones.filter((p) =>
      p.producto.toLowerCase().includes(search.toLowerCase()) ||
      (p.lote || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.responsable || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [producciones, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Factory className="w-7 h-7 text-amber-600" />
            <span>Control de Producción Diaria</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Registro artesanal de bolis gourmet, helados y repostería recién horneada con actualización automática de stock.
          </p>
        </div>

        <button
          id="btn-register-production"
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Lote Elaborado</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Elaborado Hoy
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-bold text-amber-900 block mt-1">
            {stats.totalHoy} uds.
          </strong>
          <span className="text-[10px] text-stone-500 block mt-0.5">Producción del día</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Total Lotes Registrados
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 block mt-1">
            {producciones.length} lotes
          </strong>
          <span className="text-[10px] text-stone-500 block mt-0.5">Historial completo</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Unidades Totales
          </span>
          <strong className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 block mt-1">
            {stats.totalHistorico} uds.
          </strong>
          <span className="text-[10px] text-stone-500 block mt-0.5">Producción acumulada</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-900 block tracking-wider">
              Flujo Integrado
            </span>
            <span className="text-xs text-amber-800 font-semibold leading-tight block">
              Auto-ingreso a existencias de inventario
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Table */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por producto, lote o responsable..."
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
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Lote</th>
                  <th className="p-3.5">Producto Elaborado</th>
                  <th className="p-3.5">Cantidad</th>
                  <th className="p-3.5">Responsable</th>
                  <th className="p-3.5">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No hay registros de producción que coincidan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prodReg) => (
                    <tr key={prodReg.id} className="hover:bg-stone-50/50">
                      <td className="p-3.5 whitespace-nowrap text-stone-400">
                        {formatFechaCorta(prodReg.fecha)}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px] font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                          {prodReg.lote || 'SIN LOTE'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">
                        {prodReg.producto}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          +{prodReg.cantidad} uds.
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        {prodReg.responsable || 'Equipo de cocina'}
                      </td>
                      <td className="p-3.5 text-stone-500 text-[11px]">
                        {prodReg.observacion || prodReg.notas || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nueva Producción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif font-bold text-stone-900 text-lg">
                  Registrar Lote de Producción
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduccion} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Producto Elaborado *
                </label>
                <select
                  required
                  value={selectedProductoId}
                  onChange={(e) => setSelectedProductoId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.categoria}) - Stock actual: {p.stock ?? 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Cantidad Elaborada (uds) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Código de Lote
                  </label>
                  <input
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Responsable de Producción
                </label>
                <input
                  type="text"
                  placeholder="Nombre del maestro heladero o repostero"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Pulpa de fresa fresca de Boquete, textura cremosa óptima..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sumarInventario}
                    onChange={(e) => setSumarInventario(e.target.checked)}
                    className="rounded text-amber-900 focus:ring-amber-900"
                  />
                  <span>Sumar automáticamente esta cantidad al inventario disponible</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {loading ? 'Guardando...' : 'Registrar Lote'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
