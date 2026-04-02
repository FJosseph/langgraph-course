import zod from "zod";

export const AgenticOutputSchema = zod.object({
  title: zod.string().describe("Título del resultado generado por el agente"),
  description: zod
    .string()
    .describe("Descripción detallada del resultado generado por el agente"),
  code: zod.string().describe("Código generado por el agente, si aplica"),
});
