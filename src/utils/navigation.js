export function withCurrentEnvironment(path) {
  const target = new URL(path, window.location.href);
  const env = window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT;
  if (env) target.searchParams.set('env', env);
  return target.toString();
}
