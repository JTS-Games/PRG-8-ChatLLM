import express from 'express'
import cors from 'cors'
import {AzureChatOpenAI, AzureOpenAIEmbeddings, OpenAIEmbeddings} from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const model = new AzureChatOpenAI({
    temperature: 1,
    verbose: false,
    maxTokens: 1000
});

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0.5,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

let vectorStore = await FaissStore.load("./storedVectors", embeddings);
const relevantDocs = await vectorStore.similaritySearch("What is this document about?",3);
const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");


let history = [
    { role: "system", content: "The user wants to know some games to play, begin broad then specify, to eventually end up with 1 game, don't answer specific games for the first 3 questions the user asks" },
    // { role: "system", content: `Answer the user's question with the context of ${context}` },
];

async function sendPrompt(prompt) {

    history.push(
        { role: "user", content: prompt }
    );

    // console.log(history)
    const newChat = await model.invoke(history);

    history.push(
        { role: "assistant", content: newChat.content }
    );

    return newChat.content;
}

app.post('/', async (req, res) => {
    let prompt = req.body.prompt
    let result = await sendPrompt(prompt)
    res.json({ message: result })
})

app.listen(3000, () => console.log(`Server running on http://localhost:3000`))