
import { getOperationMode, isSelfHosted } from '@/integrations/supabase';

export class EnvironmentService {
  static getEnvironmentInfo() {
    const mode = getOperationMode();
    const selfHosted = isSelfHosted();
    const isDev = import.meta.env.DEV;
    const isProd = import.meta.env.PROD;
    const nodeEnv = import.meta.env.MODE;
    
    return {
      mode,
      selfHosted,
      isDev,
      isProd,
      nodeEnv,
      useLocal: import.meta.env.VITE_USE_LOCAL_SUPABASE,
      viteMode: import.meta.env.MODE,
      envVars: {
        VITE_USE_LOCAL_SUPABASE: import.meta.env.VITE_USE_LOCAL_SUPABASE,
        VITE_SELF_HOSTED: import.meta.env.VITE_SELF_HOSTED
      }
    };
  }

  static logEnvironmentInfo() {
    const info = this.getEnvironmentInfo();
    console.group('🔧 Environment Configuration');
    console.log('Operation Mode:', info.mode);
    console.log('Self-hosted:', info.selfHosted);
    console.log('Development:', info.isDev);
    console.log('Production:', info.isProd);
    console.log('Node Environment:', info.nodeEnv);
    console.log('Environment Variables:', info.envVars);
    console.groupEnd();
    return info;
  }

  static isUsingLocalDatabase() {
    const info = this.getEnvironmentInfo();
    return info.mode === 'local' || info.mode === 'self-hosted';
  }

  static getDatabaseConnectionString() {
    const info = this.getEnvironmentInfo();
    
    switch (info.mode) {
      case 'local':
        return 'PostgreSQL Local (localhost:5432)';
      case 'self-hosted':
        return 'Self-hosted PostgreSQL';
      case 'production-remote':
        return 'Supabase Remote (Production)';
      case 'remote':
        return 'Supabase Remote (Development)';
      default:
        return 'Unknown';
    }
  }
}

// Log automaticamente quando o service for importado
if (typeof window !== 'undefined') {
  EnvironmentService.logEnvironmentInfo();
}
