import { Client } from "pg";
import { connect } from "./helpers/connect";
import fs from "node:fs";
import yaml from "js-yaml";

const SeedFiles = ["exhangeRates.yml"];

const disconnect = async (client: Client | undefined) => {
  if (client) {
    await client.end();
    console.log("Disconnected from PostgreSQL database.");
  }
};

const seedData = async (client: Client, fileName: string) => {
  try {
    const seedData = yaml.load(fs.readFileSync(`./seed/${fileName}`, "utf8"));

    for (const tableName in seedData) {
      const records = seedData[tableName];

      for (const record of records) {
        let columns = Object.keys(record);

        if (!columns.includes("CreatedAt")) {
          record["CreatedAt"] = new Date().toISOString();
        }
        if (!columns.includes("UpdatedAt")) {
          record["UpdatedAt"] = new Date().toISOString();
        }

        columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

        const query = `INSERT INTO "${tableName}" (${columns
          .map((col) => '"' + col + '"')
          .join(
            ", "
          )}) VALUES (${placeholders}) ON CONFLICT ("Id") DO UPDATE SET ${columns.map((col) => `"${col}" = EXCLUDED."${col}"`).join(", ")};`;

        await client.query(query, values);
        console.log(`Inserted/updated record in ${tableName}:`, record);
      }
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

const client = await connect();
console.log("Connected to PostgreSQL database.");

try {
  for (const fileName of SeedFiles) {
    await seedData(client, fileName);
  }
} catch (err) {
  console.error("An error occured during seeding. ", err);
} finally {
  await disconnect(client);
  process.exit(0);
}
