/**
 * LoginWelcome - Encabezado de bienvenida de la pantalla de login.
 * Presentación pura, sin estado ni lógica.
 */
export function LoginWelcome() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl font-extrabold text-center">Bienvenido</h2>
      <p className="text-base font-normal text-center text-gray-600">
        Ingresa a tu cuenta de Carmina Burana ERP
      </p>
    </div>
  );
}
