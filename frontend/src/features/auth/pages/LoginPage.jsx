import { LoginForm } from "../components/LoginForm";
import loginImage from "../../../../public/assets/images/login-image.jpg";

export default function LoginPage() {
  return (
    <div className="w-full h-screen flex flex-row items-center justify-center">
      <div className="w-4xl h-fit flex flex-row shadow-lg rounded-l-2xl rounded-r-2xl">
        <section className="w-full p-8 rounded-l-2xl border-t-1 border-l-1 border-b-1 border-gray-200 flex flex-col justify-center gap-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-center">Bienvenido</h2>
            <p className="text-base font-normal text-center text-gray-600">
              Ingresa a tu cuenta de Carmina Burana ERP
            </p>
          </div>
          <LoginForm />
        </section>
        <section className="w-full">
          <img
            src={loginImage}
            alt="Carmina Burana Image"
            className="w-full rounded-r-2xl"
          />
        </section>
      </div>
    </div>
  );
}
