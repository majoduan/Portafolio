import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary Component
 * Captura errores de React y muestra UI de fallback elegante
 * Implementa mejores prácticas de manejo de errores
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para mostrar UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Ignorar errores de caché de Spline en desarrollo (React Strict Mode)
    // Estos errores no afectan la funcionalidad y son causados por double-mounting
    const isSplineCacheError = 
      process.env.NODE_ENV === 'development' &&
      error?.message?.includes('Failed to fetch') &&
      errorInfo?.componentStack?.includes('Spline');
    
    if (isSplineCacheError) {
      console.warn('⚠️ Error de caché de Spline ignorado (React Strict Mode en desarrollo)');
      // Resetear el error automáticamente
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null
        });
      }, 100);
      return;
    }
    
    // Log del error para debugging
    console.error('🔴 Error capturado por ErrorBoundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Aquí podrías enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Card de error */}
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
              {/* Icono y título */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    ¡Oops! Algo salió mal
                  </h1>
                  <p className="text-slate-400">
                    No te preocupes, estamos trabajando en ello
                  </p>
                </div>
              </div>

              {/* Mensaje de error (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-xs font-mono text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs font-mono text-slate-400">
                      <summary className="cursor-pointer hover:text-slate-300 mb-2">
                        Ver stack trace
                      </summary>
                      <pre className="overflow-auto max-h-40 text-[10px] leading-tight">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Mensaje amigable */}
              <div className="mb-8">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Ha ocurrido un error inesperado. Puedes intentar recargar la página
                  o volver al inicio.
                </p>
                {this.state.errorCount > 1 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Este error ha ocurrido {this.state.errorCount} veces. 
                      Considera limpiar el caché del navegador.
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Intentar de nuevo
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Recargar página
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Ir al inicio
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-500 text-center">
                  Si el problema persiste, por favor contacta a{' '}
                  <a 
                    href="mailto:mate.due02@gmail.com" 
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    mate.due02@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* Info adicional */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-600">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar children normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
