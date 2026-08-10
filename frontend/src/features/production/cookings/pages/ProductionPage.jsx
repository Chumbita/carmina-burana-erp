import { useLocation } from "react-router-dom";
import ProductionRegisterPage from "./ProductionRegisterPage";
import ProductionHistoryPage from "./ProductionHistoryPage";

export default function ProductionPage() {
  const location = useLocation();
  const isRegisterMode = location.pathname.endsWith("/nuevo");

  return isRegisterMode ? <ProductionRegisterPage /> : <ProductionHistoryPage />;
}
