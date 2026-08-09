const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export const appPath = (path = '/') => `${basePath}${path.startsWith('/') ? path : `/${path}`}`;

export const relativeAppPath = (pathname = window.location.pathname) => {
  if (pathname === basePath) return '/';
  if (pathname.startsWith(`${basePath}/`)) return pathname.slice(basePath.length);
  return null;
};
