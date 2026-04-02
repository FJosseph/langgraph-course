import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { AgenticOutputSchema } from "./schemas/agenticOutput.schema";
import clientServer from "../mcps";

const handler = async () => {
  // creación del modelo
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.9,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const tools = await clientServer.getTools(); // obtenemos las tools

  // creación del agente
  const agent = createReactAgent({
    llm: model,
    tools,
    responseFormat: AgenticOutputSchema,
  });

  // input / ouput
  const systemPrompt = new SystemMessage(
    "Eres un asistente inteligente que ayuda a los usuarios a resolver sus problemas de manera eficiente y amigable.",
  );
  const userPrompt = new HumanMessage(
    "¿Cómo puedo mejorar mi productividad diaria?",
  );

  // invoke del agente
  await agent.invoke({
    messages: [systemPrompt, userPrompt],
  });

  // cerramos el cliente
  await clientServer.close(); // importante para evitar dejar conexiones abiertas
};

export default handler;
