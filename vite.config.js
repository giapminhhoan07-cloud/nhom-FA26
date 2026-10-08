import { defineConfig, loadEnv } from "vite";
import studyAiHandler from "./api/study-ai.js";

function localStudyAiApi() {
  return {
    name: "studysphere-local-study-ai-api",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      for (const key of ["STUDY_AI_API_KEY", "STUDY_AI_API_URL", "STUDY_AI_MODEL"]) {
        if (!process.env[key] && env[key]) process.env[key] = env[key];
      }

      server.middlewares.use("/api/study-ai", async (request, response) => {
        if (request.method !== "POST") {
          await studyAiHandler({ method: request.method, headers: request.headers }, responseAdapter(response));
          return;
        }

        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 18_000) {
            response.statusCode = 413;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ error: "Nội dung gửi lên quá dài." }));
            return;
          }
          chunks.push(chunk);
        }

        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          response.statusCode = 400;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: "Nội dung gửi lên không phải JSON hợp lệ." }));
          return;
        }

        await studyAiHandler(
          { method: request.method, headers: request.headers, body },
          responseAdapter(response),
        );
      });
    },
  };
}

function responseAdapter(response) {
  return {
    status(code) {
      response.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    json(body) {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(body));
    },
  };
}

export default defineConfig({
  plugins: [localStudyAiApi()],
});
