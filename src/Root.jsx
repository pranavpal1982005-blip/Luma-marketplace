import App from "./App.jsx";
import AlternativeHome from "./AlternativeHome.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

function Root() {
  return (
    <ErrorBoundary>
      {window.location.pathname === "/alternative" ? <AlternativeHome /> : <App />}
    </ErrorBoundary>
  );
}

export default Root;
