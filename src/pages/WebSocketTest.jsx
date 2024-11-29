import React, { useEffect, useState } from 'react';

const WebSocketTest = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // WebSocket 초기화
        const socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = () => {
            console.log("WebSocket 연결 성공");
            setMessages(prev => [...prev, "WebSocket 연결 성공"]);
        };

        socket.onmessage = (event) => {
            console.log("서버로부터 메시지:", event.data);
            setMessages(prev => [...prev, `서버: ${event.data}`]);
        };

        socket.onclose = () => {
            console.log("WebSocket 연결 종료");
            setMessages(prev => [...prev, "WebSocket 연결 종료"]);
        };

        socket.onerror = (error) => {
            console.error("WebSocket 오류:", error);
            setMessages(prev => [...prev, "WebSocket 오류"]);
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    const sendMessage = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(input);
            setMessages(prev => [...prev, `클라이언트: ${input}`]);
            setInput("");
        } else {
            console.error("WebSocket이 연결되지 않았습니다.");
        }
    };

    return (
        <div>
            <h1>WebSocket 테스트</h1>
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={sendMessage}>전송</button>
            </div>
            <div>
                <h2>메시지 로그</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WebSocketTest;
