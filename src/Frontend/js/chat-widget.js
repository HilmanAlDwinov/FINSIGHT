// =====================================================
// FINSIGHT - AI Chat Widget Module
// =====================================================

// Chat widget state
let chatWidgetState = {
    messages: [],
    isOpen: false,
    isLoading: false,
    financialContext: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat widget
    initializeChatWidget();
});

// =====================================================
// Chat Widget Initialization
// =====================================================
function initializeChatWidget() {
    // Add event listeners
    const chatBubble = document.getElementById('chatBubble');
    const chatPanel = document.getElementById('chatPanel');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    if (!chatBubble || !chatPanel) {
        console.error('Chat widget elements not found');
        return;
    }

    // Redirect to chat page
    chatBubble.addEventListener('click', () => {
        window.location.href = 'chat.html';
    });

    // Close chat panel
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            closeChatPanel();
        });
    }

    // Clear chat
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            clearChat();
        });
    }

    // Send message
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }

    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', (e) => {
            autoResizeTextarea(e.target);
        });

        // Enter to send, Shift+Enter for new line
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Suggestion buttons
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.getAttribute('data-message');
            if (message && chatInput) {
                chatInput.value = message;
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // Load chat history
    loadChatHistory();

    // Load financial context
    loadFinancialContext();
}

// =====================================================
// Toggle Functions
// =====================================================
function toggleChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const chatBubble = document.getElementById('chatBubble');

    if (chatPanel && chatBubble) {
        chatWidgetState.isOpen = !chatWidgetState.isOpen;

        if (chatWidgetState.isOpen) {
            chatPanel.classList.add('open');
            chatBubble.classList.add('active');
        } else {
            chatPanel.classList.remove('open');
            chatBubble.classList.remove('active');
        }
    }
}

function closeChatPanel() {
    const chatPanel = document.getElementById('chatPanel');
    const chatBubble = document.getElementById('chatBubble');

    if (chatPanel && chatBubble) {
        chatWidgetState.isOpen = false;
        chatPanel.classList.remove('open');
        chatBubble.classList.remove('active');
    }
}

// =====================================================
// Message Functions
// =====================================================
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message to UI
    addMessageToUI('user', message);

    // Clear input
    chatInput.value = '';
    autoResizeTextarea(chatInput);

    // Hide suggestions after first message
    hideSuggestions();

    // Save to state
    chatWidgetState.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });

    // Send to AI
    sendToAI(message);

    // Save chat history
    saveChatHistory();
}

async function sendToAI(message) {
    chatWidgetState.isLoading = true;
    showTypingIndicator();

    try {
        // Prepare context
        const context = prepareContext();

        // Prepare payload
        const payload = {
            message: message,
            context: context,
            conversation_history: chatWidgetState.messages.slice(-10) // Last 10 messages
        };

        // Send to API
        const response = await APIClient.post('/ai/chat', payload);

        // Remove typing indicator
        hideTypingIndicator();

        // Add AI response to UI
        if (response && response.message) {
            addMessageToUI('ai', response.message);

            // Save to state
            chatWidgetState.messages.push({
                role: 'ai',
                content: response.message,
                timestamp: new Date().toISOString()
            });

            // Save chat history
            saveChatHistory();
        }
    } catch (error) {
        console.error('Error sending message to AI:', error);
        hideTypingIndicator();

        // Show error message
        addMessageToUI('error', 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.');
    } finally {
        chatWidgetState.isLoading = false;
    }
}

function addMessageToUI(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';

    // Format content with basic markdown support
    bubbleDiv.innerHTML = formatMessage(content);

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(new Date());

    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(timeSpan);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    scrollToBottom();
}

function formatMessage(content) {
    // Escape HTML
    const escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Convert newlines to paragraphs
    return escaped.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

// =====================================================
// UI Helper Functions
// =====================================================
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai typing-indicator';
    typingDiv.id = 'typingIndicator';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    contentDiv.appendChild(bubbleDiv);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);

    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function hideSuggestions() {
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';

    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// =====================================================
// Clear Chat
// =====================================================
function clearChat() {
    if (!confirm('Hapus semua percakapan?')) return;

    chatWidgetState.messages = [];

    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="chat-message ai">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <p>Halo! Saya AI Financial Advisor Anda. Saya siap membantu dengan:</p>
                        <ul>
                            <li>Analisis keuangan</li>
                            <li>Saran budget</li>
                            <li>Tips menabung</li>
                        </ul>
                    </div>
                    <span class="message-time">Just now</span>
                </div>
            </div>
        `;
    }

    // Show suggestions again
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) {
        suggestions.style.display = 'flex';
    }

    // Clear localStorage
    localStorage.removeItem('finsight_chat_history');
}

// =====================================================
// Chat History
// =====================================================
function saveChatHistory() {
    try {
        localStorage.setItem('finsight_chat_history', JSON.stringify(chatWidgetState.messages));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

function loadChatHistory() {
    try {
        const history = localStorage.getItem('finsight_chat_history');
        if (history) {
            chatWidgetState.messages = JSON.parse(history);

            // Restore messages to UI
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages && chatWidgetState.messages.length > 0) {
                // Clear welcome message
                chatMessages.innerHTML = '';

                // Add all messages
                chatWidgetState.messages.forEach(msg => {
                    addMessageToUI(msg.role, msg.content);
                });

                // Hide suggestions if there are messages
                hideSuggestions();
            }
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// =====================================================
// Financial Context
// =====================================================
function loadFinancialContext() {
    const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');

    chatWidgetState.financialContext = {
        wallets,
        transactions,
        budgets
    };
}

function prepareContext() {
    // Get fresh data
    loadFinancialContext();

    const { wallets, transactions, budgets } = chatWidgetState.financialContext;

    // Calculate total balance
    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

    // Calculate monthly stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= firstDayOfMonth && tDate <= now;
    });

    const monthlyIncome = monthlyTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlySavings = monthlyIncome - monthlyExpense;

    // Budget status
    const activeBudgets = budgets.filter(b => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        return now >= start && now <= end;
    });

    const budgetStatus = activeBudgets.map(b => {
        const spent = monthlyTransactions
            .filter(t => t.transaction_type === 'expense' && t.category_id === b.category_id)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            category_id: b.category_id,
            limit: b.amount,
            spent: spent,
            percentage: (spent / b.amount) * 100
        };
    });

    return {
        total_balance: totalBalance,
        monthly_income: monthlyIncome,
        monthly_expense: monthlyExpense,
        monthly_savings: monthlySavings,
        wallet_count: wallets.length,
        budget_status: budgetStatus,
        transaction_count: monthlyTransactions.length
    };
}
