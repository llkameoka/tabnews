import database from "infra/database.js";

async function status(request, response) {
  const databaseName = process.env.POSTGRES_DB;
  const updateAt = new Date().toISOString();
  const postgresVersionResult = await database.query("SHOW server_version;");
  const postgresVersionValue = postgresVersionResult.rows[0].server_version;
  const postgresMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const postgresMaxConnectionsValue =
    postgresMaxConnectionsResult.rows[0].max_connections;

  const postgresOpenConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname= $1;",
    values: [databaseName],
  });
  const postgresOpenConnectionsValue =
    postgresOpenConnectionsResult.rows[0].count;

  response.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: postgresVersionValue,
        max_connections: parseInt(postgresMaxConnectionsValue),
        open_connections: postgresOpenConnectionsValue,
      },
    },
  });
}

export default status;
