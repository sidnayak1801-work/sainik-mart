export const logger = {
  info: (message: string): void => {
    console.info(message);
  },
  error: (message: string, error?: unknown): void => {
    if (error === undefined) {
      console.error(message);
      return;
    }
    console.error(message, error);
  },
};
