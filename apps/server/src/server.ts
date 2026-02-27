import Fastify from "fastify";

const server = Fastify({ logger: true });

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.info("Server on: http://localhost:3000");
  } catch (error: unknown) {
    console.error("Server off: Error");
    server.log.error(error);
    process.exit(1);
  }
};

start();
