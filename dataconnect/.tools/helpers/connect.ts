import { Client } from "pg";

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

export { connect };
