import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 shadow-lg md:flex-row">
        <section className="flex w-full flex-col justify-center gap-8 p-6 sm:p-8 md:w-1/2">
          <div className="flex flex-col gap-2">
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl">Bienvenido</h2>
            <p className="text-base font-normal text-center text-gray-600">
              Ingresa a tu cuenta de Carmina Burana ERP
            </p>
          </div>
          <LoginForm />
        </section>
        <section className="hidden md:block md:w-1/2">
          <img
            src="/assets/images/login-image.jpg"
            alt="Carmina Burana Image"
            className="h-full w-full object-cover"
          />
        </section>
      </div>
    </div>
  );
}
