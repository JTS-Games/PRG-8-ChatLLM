import {AzureOpenAIEmbeddings, OpenAIEmbeddings, AzureChatOpenAI} from "@langchain/openai"
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
//import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

import express from 'express'
import cors from 'cors'
const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));

let vectorStore

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

async function loadStory(){
    const loader = new TextLoader("./text.txt");
    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter(
        {
            chunkSize: 500,
            chunkOverlap: 250,
        }
    );
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Document split into ${splitDocs.length} chunks. Now saving into vector store`);
    //vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
    vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    await vectorStore.save("./storedVectors");
}

loadStory();