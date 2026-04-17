import { config } from "dotenv";
// import handler from "./example";
import { handler as textProcessor } from "./intermediate/text-processor";

config();

// handler();
textProcessor(
  "Hola, la vida es un frenesí y el mundo anda cambiando constantemente",
);
