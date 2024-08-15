'use client'
import { Box, Stack, TextField, Button, Typography } from '@mui/material'
import { useState, useRef, useEffect, useCallback } from 'react'
import './styles.css'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi I'm The Walt Disney Support Agent, How can I assist you today? 🏰✨"
}

export default function Home() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef(null)
  
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  
  const characterVoices = {
    mickey: './public/character-voices/mickey.wav',
    // Add more characters
  }

  const backgroundImages = [
    '/images/bg1.jpg',
    '/images/1344524.png',
  ];
  
  let currentBackgroundIndex = 0;
  
  function createBackgroundSlideshow() {
    const slideshowContainer = document.createElement('div');
    slideshowContainer.className = 'background-slideshow';
  
    backgroundImages.forEach((imageSrc, index) => {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.className = index === 0 ? 'active' : '';
      slideshowContainer.appendChild(img);
    });
  
    document.body.insertBefore(slideshowContainer, document.body.firstChild);
  }
  
  function changeBackground() {
    const images = document.querySelectorAll('.background-slideshow img');
    images[currentBackgroundIndex].classList.remove('active');
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
    images[currentBackgroundIndex].classList.add('active');
  }
  
  // Call this function when the component mounts
  function initializeBackgroundSlideshow() {
    createBackgroundSlideshow();
    setInterval(changeBackground, 2000); // Change background every 10 seconds
  }
  
  // If using React, you can call this function in a useEffect hook
  useEffect(() => {
    initializeBackgroundSlideshow();
  });

  function detectCharacterMention(message) {
    const characterNames = Object.keys(characterVoices)
    return characterNames.find(name => message.toLowerCase().includes(name))
  }

  function playCharacterVoice(character) {
    const audio = new Audio(characterVoices[character])
    audio.play()
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)

    const newMessage = { role: 'user', content: message }
    const mentionedCharacter = detectCharacterMention(message)
    if (mentionedCharacter) {
      playCharacterVoice(mentionedCharacter)
    }
    
    setMessages(prevMessages => [...prevMessages, newMessage, { role: 'assistant', content: '' }])
    setMessage('')

    try {
      const response = await fetch('./api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, newMessage]),
      })

      if (!response.ok) throw new Error('Network response was not ok')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let content = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        content += chunk
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1]
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: content },
          ]
        })
      }
      // Check if Mickey Mouse is mentioned and play the audio
      if (message.toLowerCase().includes("mickey mouse")) {
        if (audioRef.current) {
          audioRef.current.play()
        }
      }
    } 
    catch (error) {
      console.error('Error:', error)
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later. 😔" },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [message, isLoading, messages])


  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  return (
    <Box className="chat-wrapper">
      <Box className="chat-container">
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="sparkle"></div>
        <div className="chat-header">Disney Support Chat 🏰</div>
        <Stack
          ref={chatContainerRef}
          className="message-container"
          direction="column"
          spacing={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              className={`message ${message.role}`}
            >
              <Typography>{message.content}</Typography>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack className="input-container" direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={4}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send 🚀'}
          </Button>
        </Stack>
      </Box>
      
      {/* Audio element to play Mickey Mouse's introduction */}
      <audio ref={audioRef} src="/character_voices/mickey.wav" />
    </Box>
  )
}