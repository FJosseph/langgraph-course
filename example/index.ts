import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { AgenticOutputSchema } from "./schemas/agenticOutput.schema";
import clientServer from "./mcps";

const handler = async () => {
  // creación del modelo
  const model = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const tools = await clientServer.getTools(); // obtenemos las tools

  // creación del agente
  const agent = createReactAgent({
    llm: model,
    tools,
    responseFormat: { schema: AgenticOutputSchema },
  });

  // input / ouput
  const systemPrompt = new SystemMessage({
    content: `Eres un agente inteligente que ayuda a los desarrolladores a utilizar la librería de Smile UI.
    
    Debes responder en español y proporcionar información clara y concisa sobre los componentes de Smile UI, incluyendo ejemplos de código cuando sea relevante. Si el usuario hace una pregunta sobre un componente específico, proporciona una descripción detallada de ese componente, sus props principales y un ejemplo de uso. Si el usuario tiene una pregunta más general sobre la librería, proporciona una visión general de la misma y destaca algunos de sus componentes más populares. Siempre que sea posible, incluye ejemplos de código para ilustrar tus respuestas.`,
  });

  const userPrompt = new HumanMessage({
    content: "Explícame sobre el componente SForm",
  });

  // invoke del agente
  await agent.invoke({
    messages: [systemPrompt, userPrompt],
  });

  // cerramos el cliente
  await clientServer.close(); // importante para evitar dejar conexiones abiertas
};

export default handler;
