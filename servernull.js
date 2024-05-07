const http = require('http');
const querystring = require('querystring');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const api = require("./apikey1.js")//Actual Api key is hidden for security reason
const hostname = "127.0.0.1";
const port = 3000;

const genAI = new GoogleGenerativeAI(api.Api_key); // Replace "API_KEY" with your actual API key(Api key is hidden)
const MODEL_NAME = "gemini-1.5-pro-latest";

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', false);

  // Handle the request
  res.setHeader('Content-Type', 'text/plain');
  res.statusCode = 200;

  if (req.method === 'POST' && req.url === '/') {
    let body = '';

    // Receive data from the client
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // Parse the received data when it's fully received
    req.on('end', async () => {
      // Parse the incoming data (assuming it's URL-encoded)
      const postData = querystring.parse(body);
      const receivedData = postData.text;
      console.log('Received data:', receivedData);

      try {
        // Call runChat function to get the response
        const response = await runChat(receivedData);
        console.log('Response:', response);

        // Send the response back to the client
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 200;
        res.end(response);
      } catch (error) {
        console.error('Error:', error);
        res.end('Error processing request');
      }
    });
  } else {
    res.end('Invalid request');
  }
});

async function runChat(x) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 1,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
  });

  const result = await chat.sendMessage(x);
  const response = result.response;
  // console.log('Response text:', response.text());
  return response.text();
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  });