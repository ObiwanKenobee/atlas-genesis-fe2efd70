export const securityManager = {
  validateInput: (input: string) => {
    return input.trim().length > 0;
  },
  sanitize: (input: string) => {
    return input.replace(/[<>]/g, '');
  }
};