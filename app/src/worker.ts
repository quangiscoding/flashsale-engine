import amqp from "amqplib";

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const QUEUE_NAME = "test_queue";

async function consume() {
  try {
    console.log("🔌 Consumer connecting to RabbitMQ...");
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });
    console.log(`📥 Waiting for messages in '${QUEUE_NAME}'...`);

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        console.log(`✉️ Received message: "${msg.content.toString()}"`);

        // Tells RabbitMQ the message was processed successfully and can be deleted from the queue
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("❌ Consumer error:", error);
  }
}

consume();
