"use client";

import { useRef, useState, useCallback } from "react";
import { FiUpload, FiDownload, FiX, FiFile } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  onImported: () => void;
}

export default function InventoryImport({ onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const csv =
      "nombre,descripcion,precio,categoria\nHamburguesa Clásica,Con papas fritas,1500,Comidas\nCoca-Cola 500ml,,800,Bebidas\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_inventario.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setSelectedFile(null);
    setDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
    } else {
      toast.error("Solo se aceptan archivos .csv");
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Seleccioná un archivo CSV.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/dashboard/menu-items/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar.");
      toast.success(`${data.created} producto(s) importado(s).`);
      if (data.errors?.length > 0) {
        toast.warning(`${data.errors.length} fila(s) con errores ignoradas.`);
      }
      onImported();
      handleClose();
    } catch (err) {
      console.error("[InventoryImport] import error:", err);
      toast.error(err instanceof Error ? err.message : "Error al importar.");
    } finally {
      setLoading(false);
    }
  }, [selectedFile, onImported]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-white border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
      >
        <FiUpload className="mr-1.5" />
        Importar CSV
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="w-full max-w-lg rounded-xl border border-orange-200 bg-white shadow-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <h2 className="text-base font-semibold text-neutral-900">Importar productos desde CSV</h2>
              <button
                onClick={handleClose}
                className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {/* Instrucciones */}
              <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-neutral-700 leading-relaxed">
                <p className="font-medium text-neutral-900 mb-1">Instrucciones</p>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-600">
                  <li>El archivo debe ser <span className="font-medium">.csv</span> con las columnas: <code className="bg-orange-100 px-1 rounded text-xs">nombre</code>, <code className="bg-orange-100 px-1 rounded text-xs">descripcion</code>, <code className="bg-orange-100 px-1 rounded text-xs">precio</code>, <code className="bg-orange-100 px-1 rounded text-xs">categoria</code></li>
                  <li><span className="font-medium">nombre</span> y <span className="font-medium">precio</span> son obligatorios.</li>
                  <li>El precio debe ser un número mayor a 0.</li>
                  <li>Podés descargar la plantilla de ejemplo como referencia.</li>
                </ul>
              </div>

              {/* Descargar plantilla */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors w-fit"
              >
                <FiDownload className="text-base" />
                Descargar plantilla de ejemplo
              </button>

              {/* Drop zone */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
                  dragging
                    ? "border-orange-500 bg-orange-50"
                    : selectedFile
                    ? "border-orange-400 bg-orange-50"
                    : "border-neutral-300 bg-neutral-50 hover:border-orange-400 hover:bg-orange-50"
                }`}
              >
                {selectedFile ? (
                  <>
                    <FiFile className="text-3xl text-orange-500" />
                    <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                    <p className="text-xs text-neutral-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Click para cambiar
                    </p>
                  </>
                ) : (
                  <>
                    <FiUpload className="text-3xl text-neutral-400" />
                    <p className="text-sm font-medium text-neutral-700">
                      Arrastrá tu archivo aquí o <span className="text-orange-600">hacé click</span>
                    </p>
                    <p className="text-xs text-neutral-400">Solo archivos .csv</p>
                  </>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
              />

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleImport}
                  disabled={loading || !selectedFile}
                  className="flex-1 bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50"
                >
                  {loading ? "Importando..." : "Importar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="bg-white border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
