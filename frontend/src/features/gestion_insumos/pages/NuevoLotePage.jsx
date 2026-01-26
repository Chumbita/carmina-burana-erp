import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/TextArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar,ArrowLeft } from 'lucide-react';
import { X, Plus, Trash2 } from 'lucide-react';

// Mock data de insumos disponibles
const insumosDisponibles = [
  { id: "lupulo-las-sierras", nombre: "Lúpulo las sierras", categoria: "Lúpulo", unidadMedida: "kg" },
  { id: "lupulo-cascade", nombre: "Lúpulo Cascade", categoria: "Lúpulo", unidadMedida: "kg" },
  { id: "malta-pilsen", nombre: "Malta Pilsen", categoria: "Malta", unidadMedida: "kg" },
  { id: "malta-caramelo", nombre: "Malta Caramelo", categoria: "Malta", unidadMedida: "kg" },
  { id: "levadura-ale", nombre: "Levadura Ale Americana", categoria: "Levadura", unidadMedida: "kg" },
  { id: "levadura-lager", nombre: "Levadura Lager", categoria: "Levadura", unidadMedida: "kg" },
  { id: "botella-330ml-ambar", nombre: "Botella 330ml Ámbar", categoria: "Botellas", unidadMedida: "unidades" },
  { id: "botella-500ml-ambar", nombre: "Botella 500ml Ámbar", categoria: "Botellas", unidadMedida: "unidades" },
];

export default function NuevoLotePage() {
  const now = new Date();
  const [formData, setFormData] = useState({
    numeroLote: '',
    postingTime: now.toTimeString().slice(0, 5),
    fechaIngreso: now.toISOString().split('T')[0],
    fechaVencimiento: '',
    proveedor: '',
    costoTotal: '',
    descripcion: '',
  });

  const [insumos, setInsumos] = useState([
    { id: 1, insumoId: '', cantidad: '' }
  ]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddInsumo = () => {
    setInsumos(prev => [...prev, { id: Date.now(), insumoId: '', cantidad: '' }]);
  };

  const handleRemoveInsumo = (id) => {
    setInsumos(prev => prev.filter(item => item.id !== id));
  };

  const handleInsumoChange = (id, field, value) => {
    setInsumos(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
   
    console.log('Guardando lote:', { formData, insumos });
  };

  const handleCancel = () => {
    console.log('Cancelando...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
        <div className='flex flex-row gap-1'>
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/inventario/insumos/:id')}
                className="hover:bg-neutral-300"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Entrada de Lote</h1>
        </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>

        {/* Sección de Detalles del Lote */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalles del Lote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Número de Lote */}
              <div className="space-y-2">
                <Label htmlFor="numeroLote">Número de Lote *</Label>
                <Input
                  id="numeroLote"
                  placeholder="Ej: MP-2025-001"
                  value={formData.numeroLote}
                  onChange={(e) => handleFormChange('numeroLote', e.target.value)}
                />
              </div>


              {/* Posting Time */}
              <div className="space-y-2">
                <Label htmlFor="postingTime">Posting Time</Label>
                <Input
                  id="postingTime"
                  type="time"
                  value={formData.postingTime}
                  onChange={(e) => handleFormChange('postingTime', e.target.value)}
                />
              </div>

              {/* Fecha de Ingreso */}
              <div className="space-y-2">
                <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                <Input
                  id="fechaIngreso"
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={(e) => handleFormChange('fechaIngreso', e.target.value)}
                />
              </div>

              {/* Fecha de Vencimiento */}
              <div className="space-y-2">
                <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) => handleFormChange('fechaVencimiento', e.target.value)}
                />
              </div>

              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  placeholder="Nombre del proveedor"
                  value={formData.proveedor}
                  onChange={(e) => handleFormChange('proveedor', e.target.value)}
                />
              </div>

              {/* Costo Total */}
              <div className="space-y-2">
                <Label htmlFor="costoTotal">Costo Total</Label>
                <Input
                  id="costoTotal"
                  type="number"
                  placeholder="0.00"
                  value={formData.costoTotal}
                  onChange={(e) => handleFormChange('costoTotal', e.target.value)}
                />
              </div>

              {/* Descripción  */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripción opcional del lote..."
                  value={formData.descripcion}
                  onChange={(e) => handleFormChange('descripcion', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de Insumos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Insumos</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddInsumo}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Insumo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header tabla */}
              <div className="grid grid-cols-12 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
                <div className="col-span-1">No.</div>
                <div className="col-span-5">Insumo</div>
                <div className="col-span-2">Categoría</div>
                <div className="col-span-2">Cantidad</div>
                <div className="col-span-1">U.M.</div>
                <div className="col-span-1"></div>
              </div>

              {/* Filas de insumos */}
              {insumos.map((item, index) => {
                const selectedInsumo = insumosDisponibles.find(i => i.id === item.insumoId);
                return (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-sm text-gray-600">{index + 1}</div>
                    
                    <div className="col-span-5">
                      <Select 
                        value={item.insumoId} 
                        onValueChange={(value) => handleInsumoChange(item.id, 'insumoId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar insumo" />
                        </SelectTrigger>
                        <SelectContent>
                          {insumosDisponibles.map(insumo => (
                            <SelectItem key={insumo.id} value={insumo.id}>
                              {insumo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Input 
                        value={selectedInsumo?.categoria || ''} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.cantidad}
                        onChange={(e) => handleInsumoChange(item.id, 'cantidad', e.target.value)}
                      />
                    </div>

                    <div className="col-span-1">
                      <Input 
                        value={selectedInsumo?.unidadMedida || ''} 
                        disabled 
                        className="bg-gray-50 text-xs"
                      />
                    </div>

                    <div className="col-span-1">
                      {insumos.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveInsumo(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

