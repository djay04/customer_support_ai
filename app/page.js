'use client';
import { Stack, Box, TextField, Button } from "@mui/material";
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi, I'm the Headstarter support agent. How can I assist you today?`,
  }]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' },
    ]);
    setMessage('');
  
    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      let result = '';
      const processText = async ({ done, value }) => {
        if (done) {
          return result;
        }
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            }
          ];
        });
        return reader.read().then(processText);
      };
  
      await reader.read().then(processText);
  
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={2}
      >
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
          {
            messages.map((msg, index) => (
              <Box key={index} display='flex' justifyContent={
                msg.role === 'assistant' ? 'flex-start' : 'flex-end'
              }>
                <Box bgcolor={
                  msg.role === 'assistant' ? 'primary.main' : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
                >
                  {msg.content}
                </Box>
              </Box>
            ))
          }
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}





