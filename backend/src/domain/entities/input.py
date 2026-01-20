class Input:
    def __init__(
        self,
        name: str,
        brand: str | None,
        category: str | None,
        unit: str,
        minimum_stock: float,
        image: str | None = None,
        status: bool = True
    ):
        if minimum_stock < 0:
            raise ValueError("El stock mínimo no puede ser negativo")
        
        if not name.strip():
            raise ValueError("El nombre no puede estar vacío")

        self.name = name
        self.brand = brand
        self.category = category
        self.unit = unit
        self.minimum_stock = minimum_stock
        self.image = image
        self.status = status
