import { LoginForm } from "../components/LoginForm";
import { LoginWelcome } from "../components/LoginWelcome";
import { LoginIllustration } from "../components/LoginIllustration";

/**
 * LoginPage - Página de autenticación.
 * Solo compone el layout con componentes de presentación y el formulario.
 */
export default function LoginPage() {
  return (
    <div className="w-full h-screen flex flex-row items-center justify-center">
      <div className="w-4xl h-fit flex flex-row shadow-lg rounded-l-2xl rounded-r-2xl">
        <section className="w-full p-8 rounded-l-2xl border-t-1 border-l-1 border-b-1 border-gray-200 flex flex-col justify-center gap-10">
          <LoginWelcome />
          <LoginForm />
        </section>
        <LoginIllustration />
      </div>
    </div>
  );
}
