import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "👋 Hi! I'm NammaBot. Ask me to analyze a station or plan a route!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            // Replace with your actual backend URL
            const res = await axios.post('https://transport-roi-engine.onrender.com/chat', { message: userMsg });
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'bot', text: "⚠️ Error connecting to AI brain." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* CHAT WINDOW */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: '110px', right: '30px', zIndex: 9999,
                    width: '320px', maxWidth: '85vw', height: '450px', maxHeight: '70vh', 
                    background: 'white',
                    borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    fontFamily: 'Segoe UI, sans-serif', animation: 'fadeIn 0.3s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        background: '#673AB7', color: 'white', padding: '16px', 
                        fontWeight: 'bold', display:'flex', justifyContent:'space-between', alignItems: 'center'
                    }}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <span>🤖</span>
                            <span>NammaBot AI</span>
                        </div>
                        <span onClick={() => setIsOpen(false)} style={{cursor:'pointer', fontSize:'18px'}}>✖</span>
                    </div>

                    {/* Messages Area */}
                    <div style={{flex: 1, padding: '15px', overflowY: 'auto', background: '#f8f9fa'}}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? '#673AB7' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#333',
                                padding: '12px', borderRadius: '12px', marginBottom: '10px',
                                maxWidth: '80%', fontSize: '14px', lineHeight: '1.5',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                borderBottomRightRadius: msg.sender === 'user' ? '0' : '12px',
                                borderBottomLeftRadius: msg.sender === 'user' ? '12px' : '0',
                                marginLeft: msg.sender === 'user' ? 'auto' : '0'
                            }}>
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                            </div>
                        ))}
                        {loading && <div style={{color:'#999', fontSize:'12px', marginLeft:'10px', fontStyle:'italic'}}>Thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{padding: '12px', borderTop: '1px solid #eee', display: 'flex', gap:'10px', background:'white'}}>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            style={{
                                flex: 1, border: '1px solid #ddd', borderRadius:'20px', 
                                padding: '10px 15px', outline: 'none', fontSize:'14px'
                            }}
                        />
                        <button onClick={handleSend} style={{
                            border:'none', background:'#673AB7', color:'white', 
                            borderRadius:'50%', width:'40px', height:'40px', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center'
                        }}>
                            ➤
                        </button>
                    </div>
                </div>
            )}

            {/* BUTTON COMPONENT */}
            <StyledWrapper onClick={() => setIsOpen(!isOpen)}>
                <div className="tooltip-container">
                    
                    <div className="tooltip">
                        <div className="profile">
                            <div className="user">
                                <div className="img">🤖</div>
                                <div className="details">
                                    <div className="name">NammaBot</div>
                                    <div className="username">@AI_Helper</div>
                                </div>
                            </div>
                            <div className="about">Always Online</div>
                        </div>
                    </div>

                    <div className="text">
                        <a className="icon" href="#chat">
                            <div className="layer">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span className="svg">
                                    <svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="text">Chat</div>
                        </a>
                    </div>
                </div>
            </StyledWrapper>
        </>
    );
}

const StyledWrapper = styled.div`
  /* 1. FIXED POSITIONING: Increased distance from right edge */
  position: fixed;
  bottom: 30px; 
  right: 30px; 
  z-index: 9999;

  .tooltip-container {
    --color: #673AB7;
    --border: rgba(103, 58, 183, 0.5);
    position: relative;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 17px;
    border-radius: 10px;
  }

  .tooltip {
    position: absolute;
    top: 0;
    
    /* 2. FIXED TOOLTIP ALIGNMENT: Align to right instead of center */
    right: 0; 
    left: auto;
    transform: none; 
    /* ----------------------------------------------------------- */

    padding: 10px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
    border-radius: 15px;
    min-width: 150px;
    box-shadow: inset 5px 5px 5px rgba(0, 0, 0, 0.2),
      inset -5px -5px 15px rgba(255, 255, 255, 0.1),
      5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.1);
  }

  .profile {
    background: #673AB7; 
    border-radius: 10px 15px;
    padding: 10px;
    border: 1px solid rgba(255,255,255, 0.2);
  }

  .tooltip-container:hover .tooltip {
    top: -110px;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .icon {
    text-decoration: none;
    color: #fff;
    display: block;
    position: relative;
  }
  .layer {
    width: 55px;
    height: 55px;
    transition: transform 0.3s;
  }
  .icon:hover .layer {
    transform: rotate(-35deg) skew(20deg);
  }
  .layer span {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border: 2px solid #fff;
    border-radius: 50%;
    transition: all 0.3s;
    padding: 10px;
    background: #fff;
    box-shadow: inset 5px 5px 5px rgba(0, 0, 0, 0.2),
      inset -5px -5px 15px rgba(255, 255, 255, 0.1),
      5px 5px 15px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.05);
  }

  .tooltip-container:hover .layer span {
    border-radius: 10px;
    background: var(--color);
  }

  .tooltip-container:hover .svg path {
    fill: #fff;
  }

  .layer span,
  .text {
    color: var(--color);
    border-color: var(--color);
  }

  .icon:hover.layer span {
    box-shadow: -1px 1px 3px var(--color);
  }
  .icon .text {
    position: absolute;
    left: 50%;
    bottom: -5px;
    opacity: 0;
    font-weight: 700;
    transform: translateX(-50%);
    transition: bottom 0.3s ease, opacity 0.3s ease;
  }
  .icon:hover .text {
    bottom: -35px;
    opacity: 1;
  }

  .icon:hover .layer span:nth-child(1) {
    opacity: 0.2;
  }
  .icon:hover .layer span:nth-child(2) {
    opacity: 0.4;
    transform: translate(5px, -5px);
  }
  .icon:hover .layer span:nth-child(3) {
    opacity: 0.6;
    transform: translate(10px, -10px);
  }
  .icon:hover .layer span:nth-child(4) {
    opacity: 0.8;
    transform: translate(15px, -15px);
  }
  .icon:hover .layer span:nth-child(5) {
    opacity: 1;
    transform: translate(20px, -20px);
  }

  .svg {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
  }

  .svg svg {
      width: 25px;
      height: 25px;
  }

  .svg path {
    fill: var(--color);
  }
  .user {
    display: flex;
    gap: 10px;
  }
  .img {
    width: 40px;
    height: 40px;
    font-size: 20px;
    font-weight: 700;
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  .name {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 0;
    color: #fff;
  }
  .username {
      color: rgba(255,255,255,0.8);
      font-size: 12px;
  }
  .about {
    color: rgba(255, 255, 255, 0.7);
    padding-top: 5px;
    font-size: 12px;
  }
`;

export default ChatWidget;