const SUPPLY_ITEM_TYPES = ['supply', 'packaging_supply']

const PACKAGING_ITEM_TYPE = 'PACKAGING_SUPPLY'

/**
 * Normaliza una opción de /items/options al shape que consumen los
 * selectores de abastecimiento (id/name/brand_name/base_uom_symbol).
 */
export function mapItemOptionToSupply(option) {
  return {
    id: option.item_id,
    name: option.name,
    brand_name: option.brand,
    base_uom_symbol: option.uom_symbol,
    item_type: option.item_type,
  }
}

export function mapItemOptionsToSupplies(options = []) {
  return options
    .filter((option) => SUPPLY_ITEM_TYPES.includes(option.item_type))
    .map(mapItemOptionToSupply)
}

export function isPackagingItemType(itemType) {
  return itemType?.toUpperCase() === PACKAGING_ITEM_TYPE
}

export function isPackagingSupply(supply) {
  return isPackagingItemType(supply?.item_type)
}

export function buildSupplyPayload(formData) {
  return {
    name: formData.name,
    brand_id: formData.brand_id,
    base_uom_id: formData.base_uom_id,
    min_stock_level: formData.min_stock_level ?? 0,
    supply_category: formData.supply_category,
  }
}

export function buildPackagingSupplyPayload(formData) {
  return {
    name: formData.name,
    brand_id: formData.brand_id,
    base_uom_id: formData.base_uom_id,
    min_stock_level: formData.min_stock_level ?? 0,
    packaging_type: formData.packaging_type,
    material: formData.material,
    capacity_ml: formData.capacity_ml || null,
  }
}

export function toSupplyFormValues(supply) {
  return {
    name: supply.name,
    brand_id: supply.brand_id,
    supply_category: supply.supply_category,
    base_uom_id: supply.base_uom_id,
    min_stock_level: Number(supply.min_stock_level),
  }
}

export function toPackagingSupplyFormValues(packagingSupply) {
  return {
    name: packagingSupply.name,
    brand_id: packagingSupply.brand_id,
    base_uom_id: packagingSupply.base_uom_id,
    min_stock_level:
      packagingSupply.min_stock_level != null ? Number(packagingSupply.min_stock_level) : 1,
    packaging_type: packagingSupply.packaging_type,
    material: packagingSupply.material,
    capacity_ml:
      packagingSupply.capacity_ml != null ? Number(packagingSupply.capacity_ml) : undefined,
  }
}

export function resolveSupplyCategory(supply) {
  return supply?.category ?? supply?.supply_category ?? supply?.packaging_type ?? '-'
}

export function getSupplyDetailRoute(supply) {
  return isPackagingSupply(supply)
    ? `/inventario/insumos/envases/${supply.id}`
    : `/inventario/insumos/${supply.id}`
}
