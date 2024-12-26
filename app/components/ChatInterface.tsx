'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePlus, Menu, X } from 'lucide-react';
import { processMessage } from '@/app/actions';
import DraggableItem from './DraggableItem';
import DroppableZone from './DroppableZone';
import { useStytchUser } from '@stytch/react';

const loadChats = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatHistories');
    return saved ? JSON.parse(saved) : { General: [] };
  }
  return { General: [] };
};

const loadTopics = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('topics');
    return saved ? JSON.parse(saved) : ['General'];
  }
  return ['General'];
};

const ChatInterface = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState(loadChats());
  const [topics, setTopics] = useState(loadTopics());
  const [currentTopic, setCurrentTopic] = useState('General');
  const [newTopic, setNewTopic] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toneState, setToneState] = useState({
    current: 'casual',
    available: ['friendly', 'professional']
  });

  const topicInputRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories));
    localStorage.setItem('topics', JSON.stringify(topics));
  }, [chatHistories, topics]);

  const handleNewTopicChange = (e) => {
    if (topicInputRef.current) {
      topicInputRef.current.focus();
    }

    setNewTopic(e.target.value);

    
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    setIsLoading(true);
    
    try {
      let imageData = null;
      if (selectedImage) {
        const buffer = await selectedImage.arrayBuffer();
        imageData = Buffer.from(buffer).toString('base64');
      }

      const currentHistory = chatHistories[currentTopic] || [];
      const response = await processMessage({
        message: inputText.trim(),
        imageData,
        history: currentHistory,
        tone: toneState.current
      });

      const userMessage = {
        type: 'user',
        content: inputText,
        image: imagePreview
      };

      const aiMessage = {
        type: 'ai',
        content: response.text
      };

      setChatHistories(prev => ({
        ...prev,
        [currentTopic]: [...(prev[currentTopic] || []), userMessage, aiMessage]
      }));

      setSelectedImage(null);
      setImagePreview(null);
      setInputText('');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setChatHistories(prev => ({
        ...prev,
        [currentTopic]: [...(prev[currentTopic] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && over.id === 'tone-droppable') {
      const draggedTone = active.id;
      setToneState((prev) => ({
        current: draggedTone,
        available: [...prev.available.filter((tone) => tone !== draggedTone), prev.current]
      }));
    }
  };

  const addTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics(prev => [...prev, newTopic]);
      setChatHistories(prev => ({
        ...prev,
        [newTopic]: []
      }));
      setCurrentTopic(newTopic);
      setNewTopic('');
      setSidebarOpen(false);
    }
  };

  const clearChat = () => {
    setChatHistories(prev => ({
      ...prev,
      [currentTopic]: []
    }));
    setSidebarOpen(false);
  };

  const deleteTopic = (topic) => {
    if (topic === 'General') return;
    const newHistories = { ...chatHistories };
    delete newHistories[topic];
    setChatHistories(newHistories);
    setTopics(prev => prev.filter(t => t !== topic));
    setCurrentTopic('General');
    setSidebarOpen(false);
  };

  const ChatMessages = () => (
    <div className="flex-1 overflow-y-auto p-4">
      {chatHistories[currentTopic]?.map((message, index) => (
        <div
          key={index}
          className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
        >
          <Card
            className={`inline-block p-3 max-w-[90%] md:max-w-[70%] ${
              message.type === 'user' ? 'bg-blue-100' : 'bg-white'
            }`}
          >
            {message.image && (
              <img src={message.image} alt="User uploaded" className="max-w-full mb-2 rounded" />
            )}
            {message.content}
          </Card>
        </div>
      ))}
    </div>
  );

  const InputArea = () => {
  
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []); // Ensure this runs only once when the component mounts.
  
    return (
      <div className="p-4 bg-white border-t">
        {imagePreview && (
          <div className="mb-2">
            <img src={imagePreview} alt="Preview" className="max-h-32 rounded" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="mt-1"
            >
              Remove
            </Button>
          </div>
        )}
        <div className="flex gap-2 flex-col sm:flex-row">
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    );
  };
  

  const Sidebar = () => (
    <div className={`
      fixed top-0 left-0 h-full bg-gray-50 p-4 border-r transform transition-transform duration-300 z-50
      md:relative md:transform-none md:block
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      w-64
    `}>
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="font-semibold">Topics</h2>
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="mb-4">
        <Input
          ref={topicInputRef}
          value={newTopic}
          onChange={handleNewTopicChange}
          placeholder="New Topic"
          className="mb-2"
        />
        <Button onClick={addTopic} className="w-full mb-2">
          Add Topic
        </Button>
        <Button onClick={clearChat} variant="outline" className="w-full">
          Clear Current Chat
        </Button>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {topics.map((topic) => (
          <div key={topic} className="flex items-center justify-between">
            <div
              onClick={() => {
                setCurrentTopic(topic);
                setSidebarOpen(false);
              }}
              className={`flex-1 p-2 mb-2 rounded cursor-pointer ${
                currentTopic === topic ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              {topic}
            </div>
            {topic !== 'General' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTopic(topic)}
                className="ml-2"
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ToneSelector = () => (
    <div className="bg-white p-4 border-b overflow-x-auto">
      <h3 className="mb-2 text-sm md:text-base">Available tones:</h3>
      <div className="flex gap-2 mb-4 flex-nowrap">
        {toneState.available.map((tone) => (
          <DraggableItem
            key={tone}
            id={tone}
            title={tone.charAt(0).toUpperCase() + tone.slice(1)}
          />
        ))}
      </div>
      <DroppableZone>
        <h4 className="text-sm text-gray-500 mb-2">Current tone:</h4>
        <Card className="p-2 bg-blue-100">
          {toneState.current.charAt(0).toUpperCase() + toneState.current.slice(1)}
        </Card>
      </DroppableZone>
    </div>
  );

  return (
    <div className="flex items-center min-h-screen justify-center p-4">
      <div className="w-full max-w-6xl h-[700px] bg-white rounded-lg shadow-lg flex relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 md:hidden z-50"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sidebar />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col">
          <DndContext onDragEnd={handleDragEnd}>
            <ToneSelector />
            <ChatMessages />
            <InputArea />
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;