import React, { ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

interface GoogleMapsWrapperProps {
  children: ReactNode;
}

// Access provisioned API Key from environment or fallback to provisioned demo key
export const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyBXhdFhJTjqUhzrDPTwc5Y68uP9Rdtdmaw';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class GoogleMapsErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('GoogleMapsErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 text-blue-200 text-xs space-y-1">
          <p className="font-semibold text-white">Interactive Map Standby</p>
          <p className="text-slate-400">
            Map services are operating in manual entry mode. You can enter your street address and select your nearest police station using the form below.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({ children }) => {
  return (
    <GoogleMapsErrorBoundary>
      <APIProvider
        apiKey={GOOGLE_MAPS_API_KEY}
        solutionChannel="GMP_mcp_codeassist_v1_aistudio"
        libraries={['places', 'marker', 'geometry']}
      >
        {children}
      </APIProvider>
    </GoogleMapsErrorBoundary>
  );
};
