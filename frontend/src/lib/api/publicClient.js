import { createHttpClient } from "./httpClient";

// Cliente HTTP público para realizar peticiones que no requieran token
const publicClient = createHttpClient();

export default publicClient;
