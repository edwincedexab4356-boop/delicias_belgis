import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { Categoria } from '../../types';
import { categoriasService } from '../../services/categoriasService';

interface CategoriasViewProps {
  categorias: Categoria[];
  onRefreshData?: () => void;
}

export const CategoriasView: React.FC<CategoriasViewProps> = ({
  categorias,
  onRefreshData,
}) => {
  const [editingCat, setEditingCat] = useState<Partial<Categoria> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingCat({
      nombre: '',
      descripcion: '',
      orden: categorias.length + 1,
      activa: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCat({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.nombre) return;
    setLoading(true);

    try {
      if (editingCat.id) {
        await categoriasService.actualizarCategoria(editingCat.id, editingCat);
        setFeedback('Categoría actualizada con éxito.');
      } else {
        await categoriasService.crearCategoria(editingCat as any);
        setFeedback('Categoría creada con éxito.');
      }
      setIsModalOpen(false);
      onRefreshData?.();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await categoriasService.eliminarCategoria(id);
      onRefreshData?.();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-amber-600" />
            <span>Categorías del Menú</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Organiza las secciones del menú digital y del catálogo del punto de venta.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((cat, idx) => (
          <div
            key={cat.id ? `${cat.id}-${idx}` : `cat-${idx}`}
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Orden #{cat.orden ?? 1}
                </span>
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mt-3">
                {cat.nombre}
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                {cat.descripcion || 'Sin descripción'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cat.activa !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {cat.activa !== false ? 'Activa' : 'Inactiva'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-amber-900 hover:bg-amber-50 cursor-pointer"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingCat && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                {editingCat.id ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bolis Gourmet, Helados, Repostería..."
                  value={editingCat.nombre || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve detalle sobre los productos incluidos..."
                  value={editingCat.descripcion || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingCat.orden ?? 1}
                  onChange={(e) => setEditingCat({ ...editingCat, orden: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
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
