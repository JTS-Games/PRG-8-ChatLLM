import {AzureOpenAIEmbeddings, AzureChatOpenAI} from "@langchain/openai"
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({
    temperature: 0.5,
})

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

let vectorStore = await FaissStore.load("./storedVectors", embeddings)

async function askQuestion(){

    const relevantDocs = await vectorStore.similaritySearch("What is this document about?",3);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

    const response = await model.invoke([
        ["system", "Use the following context to answer the user's question. Only use information from the context."],
        ["user", `Context: ${context}\n\nQuestion: What is this document about?`]
    ]);
    console.log("\nAnswer found:");
    console.log(response.content);
}

askQuestion();