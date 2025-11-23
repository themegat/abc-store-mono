// @ts-check

import { Client } from "pg";

type User = {
  rolname: string;
  rolsuper?: boolean;
  rolcreaterole?: boolean;
  rolcreatedb?: boolean;
  rolcanlogin?: boolean;
  password?: string;
};

const connect = async () => {
  const client = new Client({
    user: "postgres",
    password: "",
    host: "127.0.0.1",
    port: 5432,
    database: "abcstore",
  });

  await client.connect();
  return client;
};

const userExists = async (client: Client, username: string) => {
  const result = await client.query(
    `SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin \
        FROM pg_roles
        WHERE rolname = '${username}';`
  );
  return result.rows.length > 0;
};

const createUser = async (client: Client, user: User) => {
  const rolename = user.rolname;
  const password = user.password;

  if (password && password.length > 4) {
    let sql: string | undefined = undefined;
    if (user.rolcanlogin) {
      sql = `CREATE ROLE ${rolename} WITH LOGIN PASSWORD '${password}';`;
    }
    if (sql) {
      return await client.query(sql);
    } else {
      throw new Error("Not sql stament executed");
    }
  } else {
    throw new Error("Invalid password");
  }
};

let client: Client | undefined = undefined;

try {
  const user: User = {
    rolname: "abc_store_api",
    password: "develop1234",
    rolcanlogin: true,
  };

  client = await connect();
  const hasUser = await userExists(client, user.rolname);
  if (hasUser) {
    console.log("User already exists");
  } else {
    await createUser(client, user);
    console.log(`User ${user.rolname} created`);
  }

  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  if (client) {
    console.debug("Closing client");
    client.connection.end();
  }
}
