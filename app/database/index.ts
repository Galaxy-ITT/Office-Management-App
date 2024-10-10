import { Pool } from 'pg';
// import run from './tables/tables';
import { superAdmin } from './tables/tables';
import { adminsTable } from './tables/tables';
import { recordsTable } from './tables/tables';
import { AddColumns } from './tables/tables';

const config = {
  user: "avnadmin",
  password: "AVNS_WE-5aEvUajoCWynTMiW",
  host: "ssg-galaxy.a.aivencloud.com",
  port: 14636,
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: false,
    ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUUK/hJcaDUdj26Gtfj4V7A0GD6J0wDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZjJkNGEwNzUtYzc0YS00ZGU5LTgyZjgtNGUzMzZiYTdj
MTdmIFByb2plY3QgQ0EwHhcNMjQwNDA1MTMzNDM2WhcNMzQwNDAzMTMzNDM2WjA6
MTgwNgYDVQQDDC9mMmQ0YTA3NS1jNzRhLTRkZTktODJmOC00ZTMzNmJhN2MxN2Yg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKlsUS6f
dLqRfdRv8mBk4e+l+m2pX0BSL1Nvjtd4q6Qvheha5OhfAaD1rZz3+gIBQv2a9hM5
yzc++0GSDvA+8Flf2qAOSMaTRIuARZJSfRvy/1GTMU9qT2CWHSnHGjLS4/O4kxYF
cLoJ/DiZnlC4IYgXS1BalokxmLrL1xmwh6PO4wFn3E9LXTpgayc3o1YFbOig2bau
XzCHTv80XCX5C+73qlTN5taXDlVArcR8TTmTPVzwygpKEEISP7IN3UrFZdVJHH9x
5PL5a0RAM7sZtTz/owZke73aI0ClEtq7rW2grcVK1kWalUef9P4fu2CBWWvWr/0x
GW88B+79B6vy63hd5D0ZQ1F3RweGfwEaGRnowCwktaE5WJIq1Bsp323ROM1xq2Wo
QAgc/SNkMw0MF+GGnj14Zed0oyTNYc17XzlR1L5yXjbVNYfaVnnKf8fJ6741t1dn
h/J/UVTIUmV2HPZwgn/EM1A80vw/dCgaH6VAviiwOYrgNHK/quwwl5UgiQIDAQAB
oz8wPTAdBgNVHQ4EFgQUyDZR4Vrg6iPEIMNXsUPavc8AYp0wDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAKGHhH7ZuDUn/kJP
4RK9pvsQfQXcJjvCxXBRPSESkgUaRoDcMe3GjElbzPjNX8nw0qe3b+3RugpTPjoj
gGDI8rcU5cmkK3Z87XnQKtgEypFMUMXD3V1uUsuA9oNB5qMoSsL6hnfH3kVEOHIb
/qRSElI/GbxBzWV8LAh0tOAO0tllQO0raGHSTm7SV93zGKt8Rzax0V8dEajnpm7F
3kk1CE2PWpCGlZqRCriDfUB3E7yOX60lFjA5Da4L6DTrCoTH1zs8cHyGXTQhiem2
5Z/qE89kEqfk5V0nXWb7B5PxWNwR4lW/LmoYKIabY9BBYQ/QUt5xLRKYOU24vBVk
ZminWqf5ZnU087+Wr+Z22yKqdLe9/Uugxk3Nptc5IAtKAIroSkcPo+Dscmtlloa8
qTwmCPbXBPGROAOCLZ09+z/3rrYX7yISC5/Owp4jNx8HcDUP603adMDgoQpXALYx
MuBZSlm41QimwxT2wV0AIahp0UuPzAAtDrtKB66wisSP5MVhAA==
-----END CERTIFICATE-----`
  },
};

let client: Pool | null = null;

export async function getClient() {
  if (client) return client;

  client = new Pool(config);
  await client.connect();
  const result = await client.query("SELECT VERSION()");
  console.log(result.rows[0].version);
  console.log("Connection Successful!");
  superAdmin();
  adminsTable();
  recordsTable();
  AddColumns();


  return client;
}