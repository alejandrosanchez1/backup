import { Toast } from '@capacitor/toast';

export const notify = async (message: string) => {
  await Toast.show({
    text: message,
    duration: 'short',
    position: 'bottom',
  });
};

// Luego en cualquier parte de tu app solo haces:
// notify("Guardado correctamente");
