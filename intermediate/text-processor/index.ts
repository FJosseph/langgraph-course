import { HumanMessage } from "@langchain/core/messages";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";

// const model = new ChatOpenAI({
// model: "o1-mini",
// apiKey: process.env.OPENAI_API_KEY,
// });

const model = new ChatOllama({
  model: "qwen2.5-coder:7b-instruct-q4_K_M",
});

/*
 * Text processor able to process text and categorize it as positive or negative for give a feedback response
 */
export const handler = async (inputText: string) => {
  // state
  const exampleState = Annotation.Root({
    inputText: Annotation<string>(),
    processedText: Annotation<string>(),
    category: Annotation<string>(),
    negativeText: Annotation<string>(),
    positiveText: Annotation<string>(),
    finalText: Annotation<string>(),
  });

  // nodes

  const processorNode = async (state: typeof exampleState.State) => {
    const { inputText } = state;

    const prompt = PromptTemplate.fromTemplate(
      "Analiza el siguiente texto y corrige cualquier error de ortografía o gramática:\n\n{inputText}",
    );

    const formattedPrompt = await prompt.format({ inputText });

    const inputMessage = new HumanMessage({ content: formattedPrompt });

    const response = await model.invoke([inputMessage]);

    return { processedText: response.content };
  };

  const categorizeNode = async (state: typeof exampleState.State) => {
    const { processedText } = state;

    const prompt = PromptTemplate.fromTemplate(
      "Analiza el siguiente texto y categorízalo como 'positive' o 'negative':\n\n{processedText}",
    );

    const formattedPrompt = await prompt.format({ processedText });

    const inputMessage = new HumanMessage({ content: formattedPrompt });

    const response = await model.invoke([inputMessage]);

    const category = String(response.content).trim();

    return { category };
  };

  const negativeResponseNode = async (state: typeof exampleState.State) => {
    const { processedText } = state;

    const prompt = PromptTemplate.fromTemplate(
      "El siguiente texto es negativo. Proporciona una respuesta positiva en base al texto procesado:\n\n{processedText}",
    );

    const formattedPrompt = await prompt.format({ processedText });

    const inputMessage = new HumanMessage({ content: formattedPrompt });

    const response = await model.invoke([inputMessage]);

    return { negativeText: response.content };
  };

  const positiveResponseNode = async (state: typeof exampleState.State) => {
    const { processedText } = state;

    const prompt = PromptTemplate.fromTemplate(
      "El siguiente texto es positivo. Proporciona una respuesta negativa en base al texto procesado:\n\n{processedText}",
    );

    const formattedPrompt = await prompt.format({ processedText });

    const inputMessage = new HumanMessage({ content: formattedPrompt });

    const response = await model.invoke([inputMessage]);

    return { positiveText: response.content };
  };

  // conditional edges handlers

  const categorizeRouter = async (state: typeof exampleState.State) => {
    const { category } = state;

    if (category === "negative") {
      return "negativeResponse";
    }
    return "positiveResponse";
  };

  const graph = new StateGraph(exampleState)
    .addNode("processor", processorNode)
    .addNode("categorize", categorizeNode)
    .addNode("negativeResponse", negativeResponseNode)
    .addNode("positiveResponse", positiveResponseNode)
    .addEdge(START, "processor")
    .addConditionalEdges("categorize", categorizeRouter, [
      "negativeResponse",
      "positiveResponse",
    ])
    .addEdge("negativeResponse", END)
    .addEdge("positiveResponse", END)
    .compile();

  const result = await graph.invoke({ inputText });
  console.log(result);
};
