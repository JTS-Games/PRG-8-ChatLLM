const form = document.getElementById("questionForm")
form.addEventListener("submit", (e) => askQuestion(e))

const answerField = document.getElementById("answerField");
const chatField = document.getElementById("chatField");
const button = document.getElementById("answerButton");

let prompt = ``
let engineeredPrompt = `Answer ${prompt}`

let synth = window.speechSynthesis

async function askQuestion(e){
    button.disabled = true
    e.preventDefault()
    console.log(chatField.value)
    prompt = chatField.value
    engineeredPrompt = `Answer ${prompt}`
    console.log(prompt)
    console.log(engineeredPrompt)
    chatField.value = "";
    const options = {
        method: 'POST',
        mode:'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({prompt: engineeredPrompt} )
    }

    const response = await fetch("http://localhost:3000/", options)
    if(response.ok){
        button.disabled = false
        const data = await response.json();
        answerField.innerHTML = data.message;
        speak(data.message)
        console.log(data);
    } else {
        console.error(response.status);
    }
}

function speak(text) {
    if (synth.speaking) {
        console.log('still speaking...')
        return
    }
    if (text !== '') {
        let utterThis = new SpeechSynthesisUtterance(text)
        synth.speak(utterThis)
    }
}