export const initGA = () => {
  console.log('Google Analytics initialized');
};

export const analytics = {
  track: (event: string, data?: any) => {
    console.log('Analytics event:', event, data);
  },
  page: (path: string) => {
    console.log('Analytics page view:', path);
  }
};