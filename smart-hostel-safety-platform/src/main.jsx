import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { HostelProvider } from "./context/HostelContext.jsx";
import { ToastContainer } from "./components/common/Toast.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <HostelProvider>
    <App />
    <ToastContainer />
  </HostelProvider>
);
