import pytest
from decimal import Decimal

from src.application.dtos.bom.bom_commands_dtos import CreateBomLineData
from src.application.use_cases.bom.create_bom_use_case import CreateBomUseCase


class TestDeduplicateLines:
    def test_no_duplicates_unchanged(self):
        lines = [
            CreateBomLineData(component_item_id=1, quantity=Decimal("10"), uom=5),
            CreateBomLineData(component_item_id=2, quantity=Decimal("20"), uom=5),
        ]
        result = CreateBomUseCase._deduplicate_lines(lines)
        assert len(result) == 2
        assert result[0].component_item_id == 1
        assert result[0].quantity == Decimal("10")
        assert result[1].component_item_id == 2
        assert result[1].quantity == Decimal("20")

    def test_two_duplicates_sums_quantities(self):
        lines = [
            CreateBomLineData(component_item_id=1, quantity=Decimal("10"), uom=5),
            CreateBomLineData(component_item_id=1, quantity=Decimal("15"), uom=5),
        ]
        result = CreateBomUseCase._deduplicate_lines(lines)
        assert len(result) == 1
        assert result[0].component_item_id == 1
        assert result[0].quantity == Decimal("25")

    def test_three_plus_duplicates_sums_all(self):
        lines = [
            CreateBomLineData(component_item_id=1, quantity=Decimal("5"), uom=5),
            CreateBomLineData(component_item_id=1, quantity=Decimal("5"), uom=5),
            CreateBomLineData(component_item_id=1, quantity=Decimal("5"), uom=5),
        ]
        result = CreateBomUseCase._deduplicate_lines(lines)
        assert len(result) == 1
        assert result[0].quantity == Decimal("15")

    def test_duplicates_keep_first_uom(self):
        lines = [
            CreateBomLineData(component_item_id=1, quantity=Decimal("10"), uom=5),
            CreateBomLineData(component_item_id=1, quantity=Decimal("10"), uom=9),
        ]
        result = CreateBomUseCase._deduplicate_lines(lines)
        assert len(result) == 1
        assert result[0].uom == 5

    def test_single_line_no_change(self):
        lines = [
            CreateBomLineData(component_item_id=1, quantity=Decimal("10"), uom=5),
        ]
        result = CreateBomUseCase._deduplicate_lines(lines)
        assert len(result) == 1
        assert result[0].quantity == Decimal("10")

    def test_empty_list_returns_empty(self):
        result = CreateBomUseCase._deduplicate_lines([])
        assert result == []
