import React, { useEffect, useRef } from 'react';

const TurnstileWidget = ({ onSuccess, theme = 'light' }) => {
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const siteKey = import.meta.env.VITE_CF_SITE_KEY;

  // Keep ref in sync with latest callback
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    const currentContainer = widgetRef.current;

    const renderWidget = () => {
      if (window.turnstile && currentContainer && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(currentContainer, {
          sitekey: siteKey,
          theme: theme,
          callback: (token) => {
            if (onSuccessRef.current) {
              onSuccessRef.current(token);
            }
          },
        });
      }
    };

    // If Turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
    } else {
      // Otherwise wait for it to load
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [theme, siteKey]); // Exclude onSuccess to prevent re-render loops

  return <div ref={widgetRef} className="turnstile-container my-4 flex justify-center" />;
};

export default TurnstileWidget;
