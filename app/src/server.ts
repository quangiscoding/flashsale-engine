import amqp from "amqplib";

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";

async function main() {
  try {
    console.log("🔌 Connecting to RabbitMQ...");
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const queue = "test_queue";
    await channel.assertQueue(queue, { durable: false });

    const message = "Hello from Node.js + TypeScript!";
    channel.sendToQueue(queue, Buffer.from(message));
    console.log(`📥 Sent message to '${queue}': "${message}"`);

    setTimeout(async () => {
      await channel.close();
      await connection.close();
      console.log("👋 Disconnected cleanly.");
    }, 500);
  } catch (error) {
    console.error("❌ RabbitMQ connection failed:", error);
  }
}

main();
