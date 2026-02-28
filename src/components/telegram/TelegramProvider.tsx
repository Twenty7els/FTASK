'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { TelegramUser } from '@/types';

interface TelegramContextType {
  telegramUser: TelegramUser | null;
  webApp: any;
  isReady: boolean;
  isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  telegramUser: null,
  webApp: null,
  isReady: false,
  isTelegram: false,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Check if running in Telegram
    const checkTelegram = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        setWebApp(tg);
        setIsTelegram(true);
        
        // Get user data
        const userData = tg.initDataUnsafe?.user;
        if (userData) {
          setTelegramUser(userData);
        }
        
        // Set theme
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        
        // Expand to full height
        tg.expand();
        
        setIsReady(true);
      } else {
        // Demo mode
        setIsReady(true);
        setIsTelegram(false);
      }
    };

    // Load Telegram Web App SDK if not already loaded
    if (!(window as any).Telegram) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = checkTelegram;
      script.onerror = () => {
        // Failed to load - use demo mode
        setIsReady(true);
        setIsTelegram(false);
      };
      document.head.appendChild(script);
      
      return () => {
        const existingScript = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    } else {
      checkTelegram();
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ 
      telegramUser, 
      webApp, 
      isReady, 
      isTelegram
    }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);

// Hook for Telegram haptic feedback
export const useHaptic = () => {
  const { webApp } = useTelegram();
  
  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  }, [webApp]);
  
  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  }, [webApp]);
  
  return { impactOccurred, notificationOccurred };
};

// Hook for Telegram main button
export const useMainButton = () => {
  const { webApp } = useTelegram();
  
  const show = useCallback((text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  }, [webApp]);
  
  const hide = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  }, [webApp]);
  
  return { show, hide };
};

// Hook for Telegram back button
export const useBackButton = () => {
  const { webApp } = useTelegram();
  
  const show = useCallback((onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  }, [webApp]);
  
  const hide = useCallback(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  }, [webApp]);
  
  return { show, hide };
};
