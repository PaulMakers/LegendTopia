export default function handler(req: any, res: any) {
  const serverIp = process.env.GTPS_SERVER_IP || '15.235.227.241';

  const surgeConfig = [
    '#!MANAGED-CONFIG https://legendtopia.vercel.app/api/ios interval=86400 strict=false',
    '# ==========================================',
    '# LegendTopia GTPS - Surge 5 Configuration',
    '# ==========================================',
    '',
    '[General]',
    'loglevel = notify',
    'skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local',
    'bypass-tun = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12',
    'dns-server = 1.1.1.1, 8.8.8.8',
    '',
    '[Host]',
    `growtopia1.com = ${serverIp}`,
    `growtopia2.com = ${serverIp}`,
    `www.growtopia1.com = ${serverIp}`,
    `www.growtopia2.com = ${serverIp}`,
    '',
    '[Rule]',
    'FINAL,DIRECT',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="LegendTopia-Surge.conf"');
  res.status(200).send(surgeConfig);
}
