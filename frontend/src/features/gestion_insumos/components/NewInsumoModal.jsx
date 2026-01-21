import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

import { SelectPopup } from "./ComboboxUnits"
import { ImageUpload } from "./ImageUpload"

export function NewInsumoModal({ open, onClose, onSubmit }) {

    const unidades = [
      { value: "kg", label: "Kilogramos" },
      { value: "g", label: "Gramos" },
      { value: "lt", label: "Litros" },
      { value: "un", label: "Unidad" },
    ]

    //Datos del nuevo insumo que se enviarán al back
    function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.target)

        const data = {
        nombre: formData.get("nombre"),
        categoria: formData.get("categoria"),
        unidadMedida: formData.get("unidad"),
        stockMinimo: Number(formData.get("stockMinimo")),
        stockTotal: 0,
        imagen: formData.get("imagen"),
    }

    onSubmit(data)
    onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nuevo insumo</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label className="mb-2">Nombre</Label>
                    <Input name="nombre" required />
                </div>

                <div>
                    <Label className="mb-2">Categoría</Label>
                    <Input name="categoria" />
                </div>

                <div className="grid grid-cols-2 gap-4 ">
                    {/* Columna izquierda: inputs */}
                    <div className="col-span-1 space-y-4">
                        <div>
                            <Label className="mb-2">Stock mínimo</Label>
                            <Input name="stockMinimo" type="number" />
                        </div>
                    
                        <div>
                            <Label className="mb-2">Unidad de medida</Label>
                            <SelectPopup
                                name="unidad"
                                options={unidades}
                            />
                        </div>

                    </div>

                    {/* Columna derecha: imagen */}
                    <div>
                       <Label className="mb-2">Imagen</Label>
                        <ImageUpload name="imagen" />
                    </div>
                </div>

            <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
                </Button>
                <Button type="submit">
                Guardar
                </Button>
            </div>
            </form>
        </DialogContent>
        </Dialog>
    )
}
