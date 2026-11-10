import amqp from "amqplib";
import { db } from "@/db";

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const QUEUE_NAME = "orders_queue";

async function processOrder(order: { orderId: string; userId: string; productId: string }) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE products 
       SET stock = stock - 1 
       WHERE id = $1 AND stock > 0 
       RETURNING stock`,
      [order.productId],
    );

    if (updateResult.rowCount === 0) {
      console.log(`❌ Order ${order.orderId} failed: '${order.productId}' is SOLD OUT.`);
      await client.query("ROLLBACK");
      return false;
    }

    await client.query(`INSERT INTO orders (id, user_id, product_id) VALUES ($1, $2, $3)`, [order.orderId, order.userId, order.productId]);

    await client.query("COMMIT");
    console.log(`🎉 Order ${order.orderId} processed! Remaining stock for ${order.productId}: ${updateResult.rows[0].stock}`);
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`💥 Database transaction error on order ${order.orderId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

async function consume() {
  try {
    console.log("🔌 Worker connecting to RabbitMQ...");
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.prefetch(1);

    console.log(`📥 Worker ready. Listening on '${QUEUE_NAME}'...`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const orderPayload = JSON.parse(msg.content.toString());
        await processOrder(orderPayload);
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Message execution error. Re-queueing...");
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    console.error("❌ Fatal consumer error:", error);
  }
}

consume();
