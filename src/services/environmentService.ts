
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
    console.group('🏠 Self-Hosted Environment Configuration');
    console.log('Operation Mode:', info.mode);
    console.log('Self-hosted:', info.selfHosted);
    console.log('Development:', info.isDev);
    console.log('Production:', info.isProd);
    console.log('Node Environment:', info.nodeEnv);
    console.log('Environment Variables:', info.envVars);
    console.log('🎯 Sistema configurado para modo Self-Hosted exclusivamente');
    console.groupEnd();
    return info;
  }

  static isUsingLocalDatabase() {
    // Sempre retorna true no modo self-hosted
    return true;
  }

  static getDatabaseConnectionString() {
    return 'Self-hosted PostgreSQL (Docker Container)';
  }

  static getCurrentClient() {
    return 'Self-hosted PostgreSQL Client';
  }
}

// Log automaticamente quando o service for importado
if (typeof window !== 'undefined') {
  EnvironmentService.logEnvironmentInfo();
}
