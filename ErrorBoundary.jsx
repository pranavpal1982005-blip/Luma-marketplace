import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Luma application error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-page">
        <p className="eyebrow">A SMALL DETOUR</p>
        <h1>Something needs a refresh.</h1>
        <p>Reload the page and we&apos;ll get you back to your shopping edit.</p>
        <button className="primary-button" type="button" onClick={() => window.location.reload()}>
          Reload Luma <span>→</span>
        </button>
      </main>
    );
  }
}

export default ErrorBoundary;
