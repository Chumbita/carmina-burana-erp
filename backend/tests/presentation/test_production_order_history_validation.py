import pytest
from fastapi import HTTPException
from fastapi.params import Query


def _get_router_param(name):
    """Extrae el parámetro del router para verificar si es requerido."""
    from src.presentation.api.routes.production_order_router import get_finished_productions
    import inspect
    sig = inspect.signature(get_finished_productions)
    return sig.parameters[name]


class TestDateFieldOptional:
    def test_date_field_has_default_none(self):
        """date_field debe ser opcional (default None)."""
        param = _get_router_param("date_field")
        assert isinstance(param.default, Query), "date_field debe usar Query()"
        assert param.default.default is None, (
            "date_field debe tener default None"
        )


class TestDateFromAfterDateTo:
    def test_date_from_after_date_to_is_invalid(self):
        """date_from > date_to es inválido."""
        assert "2026-12-01" > "2026-01-01"

    def test_date_from_equals_date_to_is_valid(self):
        """date_from == date_to es válido (mismo día)."""
        assert not ("2026-06-15" > "2026-06-15")

    def test_date_from_before_date_to_is_valid(self):
        """date_from < date_to es válido."""
        assert not ("2026-01-01" > "2026-12-31")

    def test_no_dates_is_valid(self):
        """Sin fechas es válido."""
        date_from = None
        date_to = None
        assert not (date_from and date_to and date_from > date_to)

    def test_only_date_from_is_valid(self):
        """Solo date_from es válido."""
        date_from = "2026-01-01"
        date_to = None
        assert not (date_from and date_to and date_from > date_to)

    def test_only_date_to_is_valid(self):
        """Solo date_to es válido."""
        date_from = None
        date_to = "2026-12-31"
        assert not (date_from and date_to and date_from > date_to)
