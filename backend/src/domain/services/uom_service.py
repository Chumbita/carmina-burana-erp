from src.domain.entities.uom import Uom

class UomConversionService:
    
    def convert_to_base(
        self,
        purchase_qty: float,
        conversion_factor: float,
        conversion_uom: Uom,
    ) -> float:
        """
        Convierte una cantidad de compra a la unidad base del sistema.
        
        Ejemplo: 3 bolsas × 10 kg/bolsa × 1.000.000 mg/kg = 30.000.000 mg
        """
        if conversion_uom.factor_to_base is None:
            raise ValueError(
                f"UOM '{conversion_uom.symbol}' es de tipo UNIT y no tiene factor_to_base. "
                "Debe usarse una UOM estándar como unidad de conversión."
            )

        return purchase_qty * conversion_factor * conversion_uom.factor_to_base
    
    def convert_between_uoms(
        self,
        quantity_in_base: float,
        to_uom: Uom,
    ) -> float:
        """
        Convierte una cantidad expresada en unidad base a otra UOM del mismo tipo.

        Ejemplo:
        30.000.000 mg ÷ 1.000.000 = 30 kg
        """
        if to_uom.factor_to_base is None:
            raise ValueError(
                "No se puede convertir a una UOM de tipo UNIT."
            )

        if quantity_in_base <= 0:
            raise ValueError("quantity_in_base debe ser mayor a 0.")

        return quantity_in_base / to_uom.factor_to_base