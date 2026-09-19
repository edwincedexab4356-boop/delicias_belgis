import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Building,
  Phone,
  Clock,
  MapPin,
  Share2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ConfiguracionNegocio, HorariosSemana } from '../../types';
import { configuracionService } from '../../services/configuracionService';
import { isFirebaseConfigured } from '../../services/firebase';
import { seedInitialData } from '../../services/initialData';

interface ConfiguracionViewProps {
  config: ConfiguracionNegocio;
  onRefreshData?: () => void;
}

const DIAS_KEYS: { key: keyof HorariosSemana; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  config,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<ConfiguracionNegocio>({ ...config });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const firebaseReady = isFirebaseConfigured();

  const handleHorarioChange = (
    dia: keyof HorariosSemana,
    field: 'activo' | 'apertura' | 'cierre',
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...(prev.horarios?.[dia] || { activo: true, apertura: '09:00', cierre: '19:30' }),
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await configuracionService.guardarConfiguracion(formData);
      setSuccessMsg('Configuración guardada exitosamente.');
      onRefreshData?.();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert('Error al guardar configuración: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemoData = () => {
    if (!window.confirm('¿Deseas restablecer los datos de demostración de Delicias Belgi?')) return;
    seedInitialData();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-amber-600" />
            <span>Configuración del Negocio</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Personaliza la identidad de Delicias Belgi, horarios, teléfono, WhatsApp y ubicación.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Identidad y Textos */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Building className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Identidad de la Marca
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                required
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Eslogan / Descripción Breve
              </label>
              <input
                type="text"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Historia / Presentación en la Tienda Pública
            </label>
            <textarea
              rows={3}
              value={formData.presentacionTexto || ''}
              onChange={(e) => setFormData({ ...formData, presentacionTexto: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Contacto y WhatsApp */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Phone className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Contacto y Canales de Atención
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Teléfono Directo
              </label>
              <input
                type="text"
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                WhatsApp de Pedidos *
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Dirección Física
              </label>
              <input
                type="text"
                value={formData.direccion || ''}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Enlace Google Maps
              </label>
              <input
                type="url"
                value={formData.googleMaps || ''}
                onChange={(e) => setFormData({ ...formData, googleMaps: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Clock className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Horarios de Apertura y Cierre
            </h3>
          </div>

          <div className="space-y-2">
            {DIAS_KEYS.map(({ key, label }) => {
              const diaConfig = formData.horarios?.[key] || { activo: true, apertura: '09:00', cierre: '19:30' };
              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 gap-3"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer sm:w-36">
                    <input
                      type="checkbox"
                      checked={diaConfig.activo}
                      onChange={(e) => handleHorarioChange(key, 'activo', e.target.checked)}
                      className="rounded text-amber-900 focus:ring-amber-900"
                    />
                    <span className="text-xs font-bold text-stone-800">{label}</span>
                  </label>

                  {diaConfig.activo ? (
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">Apertura:</span>
                        <input
                          type="time"
                          value={diaConfig.apertura}
                          onChange={(e) => handleHorarioChange(key, 'apertura', e.target.value)}
                          className="px-2 py-1 bg-white border border-stone-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">Cierre:</span>
                        <input
                          type="time"
                          value={diaConfig.cierre}
                          onChange={(e) => handleHorarioChange(key, 'cierre', e.target.value)}
                          className="px-2 py-1 bg-white border border-stone-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400 italic">Cerrado todo el día</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modalidades de Entrega y Opciones */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Sparkles className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Modalidades y Opciones de Servicio
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.paraLlevar !== false}
                onChange={(e) => setFormData({ ...formData, paraLlevar: e.target.checked })}
                className="rounded text-amber-900 focus:ring-amber-900"
              />
              <div>
                <span className="text-xs font-bold text-stone-800 block">Pedidos Para Llevar</span>
                <span className="text-[11px] text-stone-500 block">Permitir retiro en tienda en PH Bahía Limón</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aDomicilio !== false}
                onChange={(e) => setFormData({ ...formData, aDomicilio: e.target.checked })}
                className="rounded text-amber-900 focus:ring-amber-900"
              />
              <div>
                <span className="text-xs font-bold text-stone-800 block">Entrega a Domicilio (Delivery)</span>
                <span className="text-[11px] text-stone-500 block">Permitir solicitar pedidos con dirección en Colón</span>
              </div>
            </label>
          </div>
        </div>

        {/* Datos y Mantenimiento */}
        <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-stone-600" />
            <div>
              <span className="text-xs font-bold text-stone-800 block">
                Almacenamiento y Restauración
              </span>
              <span className="text-[11px] text-stone-500 block">
                {firebaseReady
                  ? 'Base de datos activa en Firebase Firestore.'
                  : 'Modo local activo con persistencia en el navegador.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:text-rose-700 hover:border-rose-300 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos Demo</span>
          </button>
        </div>

      </form>
    </div>
  );
};
