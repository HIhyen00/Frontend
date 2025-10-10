import { useState } from 'react';
import { apiClient } from '../../pet-walk/utils/axiosConfig';

interface AiChatProps {
    reportId: string;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const suggestedQuestions = [
    "이 리포트에서 가장 주의해야 할 점은 뭐야?",
    "어떤 영양소가 부족한 것 같아?",
    "추천하는 활동이나 운동이 있어?",
];

const AiChat: React.FC<AiChatProps> = ({ reportId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (question: string) => {
        if (!question.trim()) return;

        const userMessage: Message = { sender: 'user', text: question };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await apiClient.post<{ answer: string }>(`/health-reports/${reportId}/ask-ai`, { question });
            const aiMessage: Message = { sender: 'ai', text: response.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'ai', text: '답변을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.' };
            setMessages(prev => [...prev, errorMessage]);
            console.error("AI answer fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        sendMessage(input);
    };

    const handleSuggestedQuestion = (question: string) => {
        sendMessage(question);
    };

    return (
        <div className="mt-10 border-t-2 border-gray-200 pt-8">
            <h4 className="font-bold text-lg text-gray-800 mb-4 text-center">AI 어드바이저에게 질문하기</h4>
            
            {/* 메시지 표시 영역 */}
            <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <i className="fas fa-microchip text-4xl mb-2"></i>
                        <p>리포트에 대해 궁금한 점을 물어보세요.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <i className="fas fa-robot text-xl text-indigo-500 flex-shrink-0"></i>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <i className="fas fa-robot text-xl text-indigo-500 flex-shrink-0"></i>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                            <i className="fas fa-spinner fa-spin"></i> 답변을 생각 중이에요...
                        </div>
                    </div>
                )}
            </div>

            {/* 추천 질문 */}
            {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {suggestedQuestions.map((q, i) => (
                        <button key={i} onClick={() => handleSuggestedQuestion(q)} className="text-sm bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full hover:bg-indigo-200 transition">
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* 입력 영역 */}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="질문을 입력하세요..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button onClick={handleSend} disabled={isLoading} className="py-2 px-6 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-400">
                    전송
                </button>
            </div>
        </div>
    );
};

export default AiChat;
