// components/TextInput.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Wand2, CheckCircle, Loader2, MessageSquare, Volume2, PenTool, AlertTriangle } from 'lucide-react';

export default function TextInput({ value, onChange, onSubmit, placeholder }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [suggestedTones, setSuggestedTones] = useState([]);
    const [currentTone, setCurrentTone] = useState(null);
    const [showToneSuggestions, setShowToneSuggestions] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [templatePreview, setTemplatePreview] = useState(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const apiBaseUrl = 'https://9317-54-91-183-92.ngrok-free.app';

    // Update character and word count
    useEffect(() => {
        setCharCount(value.length);
        setWordCount(value.trim() ? value.trim().split(/\s+/).length : 0);
    }, [value]);

    // Analyze text for tone suggestions when user pauses typing
    useEffect(() => {
        if (value.trim().length > 10) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                analyzeTextForSuggestions();
            }, 1500); // Wait 1.5 seconds after typing stops
        } else {
            setSuggestedTones([]);
            setCurrentTone(null);
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [value]);

    const apiRequest = async (endpoint, data) => {
        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error(`Error with ${endpoint}:`, error);
            throw error;
        }
    };

    const analyzeTextForSuggestions = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const data = await apiRequest('/analyze', { text: value });
            setSuggestedTones(data.suggested_tones);
            setCurrentTone(data.current_tone);
            setShowToneSuggestions(data.suggested_tones.length > 0);
        } catch (error) {
            console.error('Error analyzing text:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = () => {
        if (value.trim() && !isProcessing) {
            onSubmit(value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const correctGrammar = async () => {
        if (!value.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            const data = await apiRequest('/correct', { text: value });
            onChange(data.corrected);
        } catch (error) {
            setError('Grammar correction failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const improveExpression = async () => {
        if (!value.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            const data = await apiRequest('/express', { text: value });
            onChange(data.rewritten);
        } catch (error) {
            setError('Failed to improve expression. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const applyTone = async (tone) => {
        if (!value.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            const data = await apiRequest('/apply-tone', {
                text: value,
                tone: tone.label.toLowerCase()
            });

            // Show template preview for 3-4 seconds
            setTemplatePreview(data.template_used);
            setTimeout(() => {
                setTemplatePreview(null);
            }, 3500); // 3.5 seconds

            // Remove the template text from the rewritten output
            let cleanedText = data.rewritten;
            if (data.template_used && data.rewritten.includes(data.template_used)) {
                cleanedText = data.rewritten.replace(data.template_used, '').trim();
            } else {
                // Fallback: Handle variations of the template pattern
                const templatePattern = /^Rewrote the following text to sound more [a-zA-Z]+( and [a-zA-Z]+)?:/i;
                cleanedText = data.rewritten.replace(templatePattern, '').trim();
            }
            console.log('Original rewritten:', data.rewritten); // Debug log
            console.log('Cleaned text:', cleanedText); // Debug log

            onChange(cleanedText); // Set only the actual rewritten content
            setShowToneSuggestions(false);
        } catch (error) {
            setError('Failed to apply tone. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Get emotion icon and color
    const getEmotionDisplay = () => {
        if (!currentTone) return null;

        const emotionIcons = {
            'joy': '😊',
            'sadness': '😔',
            'anger': '😠',
            'fear': '😨',
            'surprise': '😮',
            'neutral': '😐'
        };

        const emotionColors = {
            'joy': 'text-yellow-500',
            'sadness': 'text-blue-500',
            'anger': 'text-red-500',
            'fear': 'text-purple-500',
            'surprise': 'text-teal-500',
            'neutral': 'text-gray-500'
        };

        return {
            icon: emotionIcons[currentTone.emotion] || '📝',
            color: emotionColors[currentTone.emotion] || 'text-gray-500',
            label: currentTone.emotion.charAt(0).toUpperCase() + currentTone.emotion.slice(1)
        };
    };

    const emotionDisplay = getEmotionDisplay();

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative rounded-xl border border-gray-300 shadow-md transition-all overflow-hidden bg-white">
                {/* Template Preview */}
                {templatePreview && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 animate-pulse z-20">
                        <div className="flex items-center gap-2">
                            <PenTool size={16} />
                            <span>Template applied: {templatePreview}</span>
                        </div>
                    </div>
                )}

                {/* Input Header with Current Emotion */}
                {currentTone && (
                    <div className={`flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 ${templatePreview ? 'mt-10' : ''}`}>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Current Tone:</span>
                            <span className={`flex items-center gap-1 ${emotionDisplay?.color}`}>
                                <span className="text-lg">{emotionDisplay?.icon}</span>
                                <span>{emotionDisplay?.label}</span>
                            </span>
                            <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 capitalize">
                                {currentTone.sentiment}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {charCount} characters • {wordCount} words
                        </div>
                    </div>
                )}

                {/* Text input area with gradient border when focused */}
                <div className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative m-0.5 bg-white">
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full resize-none p-4 outline-none min-h-[150px] text-gray-800 bg-transparent"
                            disabled={isProcessing}
                            style={{ fontSize: '16px', lineHeight: '1.5' }}
                        />
                    </div>
                </div>

                {/* Word count bar - visual representation of text length */}
                {value.length > 0 && (
                    <div className="h-1 bg-gray-100">
                        <div
                            className={`h-full transition-all ${
                                wordCount < 50 ? 'bg-red-400' :
                                    wordCount < 100 ? 'bg-yellow-400' :
                                        wordCount < 300 ? 'bg-green-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min(100, (wordCount / 300) * 100)}%` }}
                        ></div>
                    </div>
                )}

                {/* Processing overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-blue-600">Processing...</span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tone Suggestions */}
                {showToneSuggestions && suggestedTones.length > 0 && (
                    <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={16} className="text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Suggested Tones:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedTones.map((tone, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyTone(tone)}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 bg-white border border-blue-200 rounded-full text-sm hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-sm"
                                    title={tone.description}
                                >
                                    <PenTool size={14} className="text-blue-500" />
                                    <span>{tone.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analyzing Indicator */}
                {isAnalyzing && (
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">Analyzing your text...</span>
                    </div>
                )}

                {/* Controls Area */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={correctGrammar}
                            disabled={isProcessing || !value.trim()}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <CheckCircle size={16} />
                            <span>Correct Grammar</span>
                        </button>

                        <button
                            onClick={improveExpression}
                            disabled={isProcessing || !value.trim()}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Wand2 size={16} />
                            <span>Improve Expression</span>
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !value.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send size={16} />
                        <span>Submit</span>
                    </button>
                </div>
            </div>

            {/* Helper Text */}
            <div className="text-sm text-gray-500 mt-3 text-center">
                <p>Ideal length: 100-300 words for natural-sounding speech</p>
            </div>
        </div>
    );
}