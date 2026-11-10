import { randomUUID } from "node:crypto";

async function runSpikeTest() {
  const TOTAL_REQUESTS = 50;
  const PRODUCT_ID = "prod_999";

  console.log(`⚡ Firing ${TOTAL_REQUESTS} concurrent requests at POST /checkout...`);

  const requests = Array.from({ length: TOTAL_REQUESTS }, (_, index) => {
    const userId = `user_${index + 1}`;

    return fetch("http://localhost:3000/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId: PRODUCT_ID }),
    }).then((res) => res.json());
  });

  const responses = await Promise.all(requests);

  console.log(`✅ All ${responses.length} requests processed by API!`);
  console.log("Sample API response:", responses[0]);
}

runSpikeTest();
