import loginImage from "../../../../public/assets/images/login-image.jpg";

/**
 * LoginIllustration - Panel decorativo con la imagen de marca.
 * Presentación pura, sin estado ni lógica.
 */
export function LoginIllustration() {
  return (
    <section className="w-full">
      <img
        src={loginImage}
        alt="Carmina Burana Image"
        className="w-full rounded-r-2xl"
      />
    </section>
  );
}
