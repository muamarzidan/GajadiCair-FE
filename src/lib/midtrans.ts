// Midtrans Snap types
interface SnapWindow extends Window {
  snap?: {
    pay: (token: string, options?: SnapPayOptions) => void;
    hide: () => void;
  };
}

interface SnapPayOptions {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

export const loadMidtransSnap = (clientKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as SnapWindow).snap) {
      resolve();
      return;
    };

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap'));
    
    document.body.appendChild(script);
  });
};

export const openMidtransSnap = (
  token: string,
  options?: SnapPayOptions
): void => {
  const snapWindow = window as SnapWindow;
  
  if (!snapWindow.snap) {
    throw new Error('Midtrans Snap not loaded');
  }

  snapWindow.snap.pay(token, options);
};

export const closeMidtransSnap = (): void => {
  const snapWindow = window as SnapWindow;
  
  if (snapWindow.snap) {
    snapWindow.snap.hide();
  }
};
