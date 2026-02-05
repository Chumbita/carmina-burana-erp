import { AppProviders } from "./providers";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;