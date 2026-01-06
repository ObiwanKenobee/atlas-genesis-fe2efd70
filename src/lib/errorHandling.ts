export const errorHandler = {
  handle: (error: Error) => {
    console.error('Error:', error);
  }
};

export const logError = (error: Error) => {
  console.error('Error logged:', error);
};