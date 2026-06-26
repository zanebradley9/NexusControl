export default function logger(req, res, next) {
  const time = new Date().toISOString();

  console.log(
    `[FIREWALL] ${time} | ${req.method} | ${req.ip} | ${req.originalUrl}`
  );

  next();
}