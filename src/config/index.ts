function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: Number(getEnv("PORT")),
  postgresUrl: getEnv("DATABASE_URL"),
  rabbitmqUrl: getEnv("RABBITMQ_URL"),
  queueName: getEnv("QUEUE_NAME"),
};
