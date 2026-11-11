import express from "express";
import amqp from "amqplib";
import { randomUUID } from "node:crypto";

const PORT = 3000;
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const QUEUE_NAME = "orders_queue";

let channel: amqp.Channel;

async function initRabbitMQ() {
  console.log("🔌 Connecting API to RabbitMQ...");
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // Ensure the queue exists before sending messages to it
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log(`✅ RabbitMQ ready. Target queue: '${QUEUE_NAME}'`);
}

const app = express();
app.use(express.json());

app.post("/checkout", (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing userId or productId" });
  }

  // 1. Generate a unique order tracking ID
  const orderId = randomUUID();

  // 2. Build the event payload
  const orderPayload = {
    orderId,
    userId,
    productId,
    createdAt: new Date().toISOString(),
  };

  // 3. Publish to RabbitMQ persistent queue
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(orderPayload)), { persistent: true });

  // 4. Return HTTP 202 Accepted immediately to the client
  return res.status(202).json({
    message: "Order request received and queued",
    orderId,
  });
});

async function start() {
  await initRabbitMQ();
  app.listen(PORT, () => {
    console.log(`🚀 API Server listening at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start API server:", err);
});
