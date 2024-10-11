import { Pool } from 'pg';
// import run from './tables/tables';
import { superAdmin } from './tables/tables';
import { adminsTable } from './tables/tables';
import { AddColumns } from './tables/tables';
import { refreshRecordsTable } from './tables/tables';
// Edit your Config here!
const config = {
  user: "",
  password: "",
  host: "",
  port: "",
  database: ""
 
};

let client: Pool | null = null;

export async function getClient() {
  if (client) return client;

  client = new Pool(config);
  await client.connect();
  const result = await client.query("SELECT VERSION()");
  console.log(result.rows[0].version);
  console.log("Connection Successful!");
 //uncomment all of these to create the tables! 
 // superAdmin();
//  adminsTable();
//  refreshRecordsTable();
//  AddColumns();


  return client;
}