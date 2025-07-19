// Real-time Collaborative Editor JavaScript
class CollaborativeEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.users = new Map();
        this.operations = [];
        this.version = 0;
        this.isConnected = false;
        this.conflictResolver = new ConflictResolver();
        this.operationalTransform = new OperationalTransform();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.simulateWebSocketConnection();
        this.startAutoSave();
        this.updateStats();
        this.simulateRemoteUsers();
    }

    setupEventListeners() {
        // Editor input events
        this.editor.addEventListener('input', (e) => {
            this.handleTextChange(e);
            this.updateStats();
        });

        this.editor.addEventListener('selectionchange', () => {
            this.handleCursorMove();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveDocument();
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                }
            }
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });

        window.addEventListener('online', () => {
            this.reconnect();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });
    }

    handleTextChange(event) {
        const operation = {
            type: 'insert',
            position: this.editor.selectionStart,
            content: event.data,
            timestamp: Date.now(),
            author: 'You',
            version: this.version++
        };

        this.operations.push(operation);
        this.broadcastOperation(operation);
        this.saveToLocalStorage();
    }

    handleCursorMove() {
        const position = this.editor.selectionStart;
        const cursorData = {
            type: 'cursor',
            position: position,
            user: 'You',
            timestamp: Date.now()
        };

        this.broadcastCursor(cursorData);
    }

    broadcastOperation(operation) {
        // Simulate WebSocket broadcast
        setTimeout(() => {
            this.simulateRemoteOperation();
        }, Math.random() * 2000 + 500);
    }

    broadcastCursor(cursorData) {
        // Simulate cursor position broadcast
        console.log('Broadcasting cursor position:', cursorData);
    }

    simulateWebSocketConnection() {
        // Simulate WebSocket connection
        setTimeout(() => {
            this.isConnected = true;
            this.updateConnectionStatus('Connected');
            console.log('WebSocket connected');
        }, 1000);

        // Simulate occasional disconnections
        setInterval(() => {
            if (Math.random() < 0.1) {
                this.simulateDisconnection();
            }
        }, 30000);
    }

    simulateDisconnection() {
        this.isConnected = false;
        this.updateConnectionStatus('Reconnecting...');
        
        setTimeout(() => {
            this.isConnected = true;
            this.updateConnectionStatus('Connected');
            this.syncWithServer();
        }, 2000 + Math.random() * 3000);
    }

    simulateRemoteOperation() {
        const remoteOperations = [
            {
                type: 'insert',
                position: Math.floor(Math.random() * this.editor.value.length),
                content: ' [Alice edited]',
                author: 'Alice',
                timestamp: Date.now(),
                version: this.version++
            },
            {
                type: 'delete',
                position: Math.floor(Math.random() * this.editor.value.length),
                length: 5,
                author: 'Bob',
                timestamp: Date.now(),
                version: this.version++
            }
        ];

        const operation = remoteOperations[Math.floor(Math.random() * remoteOperations.length)];
        this.applyRemoteOperation(operation);
    }

    applyRemoteOperation(operation) {
        // Check for conflicts
        const conflict = this.detectConflict(operation);
        
        if (conflict) {
            this.showConflictIndicator();
            operation = this.conflictResolver.resolve(operation, this.operations);
        }

        // Apply operational transformation
        const transformedOp = this.operationalTransform.transform(operation, this.operations);
        
        // Apply the operation
        this.applyOperation(transformedOp);
        this.operations.push(transformedOp);
        
        // Update version history
        this.addToVersionHistory(transformedOp);
    }

    detectConflict(operation) {
        // Simple conflict detection based on overlapping positions and timestamps
        const recentOps = this.operations.filter(op => 
            Math.abs(op.timestamp - operation.timestamp) < 1000 &&
            Math.abs(op.position - operation.position) < 10
        );
        
        return recentOps.length > 0;
    }

    applyOperation(operation) {
        const currentPos = this.editor.selectionStart;
        
        switch(operation.type) {
            case 'insert':
                const beforeText = this.editor.value.substring(0, operation.position);
                const afterText = this.editor.value.substring(operation.position);
                this.editor.value = beforeText + operation.content + afterText;
                break;
                
            case 'delete':
                const beforeDel = this.editor.value.substring(0, operation.position);
                const afterDel = this.editor.value.substring(operation.position + operation.length);
                this.editor.value = beforeDel + afterDel;
                break;
        }
        
        // Restore cursor position
        this.editor.setSelectionRange(currentPos, currentPos);
        this.updateStats();
    }

    showConflictIndicator() {
        const indicator = document.getElementById('conflictIndicator');
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 3000);
    }

    simulateRemoteUsers() {
        // Simulate Alice's cursor movement
        setInterval(() => {
            this.updateRemoteCursor('Alice', Math.random() * 500 + 100);
        }, 3000);

        // Simulate Bob's cursor movement
        setInterval(() => {
            this.updateRemoteCursor('Bob', Math.random() * 400 + 200);
        }, 4000);
    }

    updateRemoteCursor(user, position) {
        const cursors = document.querySelectorAll('.remote-cursor');
        cursors.forEach(cursor => {
            if (cursor.getAttribute('data-user') === user) {
                // Calculate line and character position
                const text = this.editor.value.substring(0, position);
                const lines = text.split('\n');
                const lineNumber = lines.length - 1;
                const charInLine = lines[lines.length - 1].length;
                
                // Approximate positioning (simplified)
                const lineHeight = 22;
                const charWidth = 8.4;
                
                cursor.style.top = (20 + lineNumber * lineHeight) + 'px';
                cursor.style.left = (20 + charInLine * charWidth) + 'px';
            }
        });
    }

    updateStats() {
        const text = this.editor.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const lines = text.split('\n').length;

        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = chars;
        document.getElementById('lineCount').textContent = lines;
    }

    updateConnectionStatus(status) {
        const syncStatus = document.querySelector('.sync-status span:nth-child(2)');
        syncStatus.textContent = status;
        
        const indicator = document.querySelector('.sync-status .status-indicator');
        if (status === 'Connected') {
            indicator.style.background = '#4caf50';
        } else {
            indicator.style.background = '#ff5722';
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveToLocalStorage();
            this.updateLastSaved();
        }, 30000);
    }

    saveToLocalStorage() {
        const data = {
            content: this.editor.value,
            operations: this.operations,
            version: this.version,
            timestamp: Date.now()
        };
        
        localStorage.setItem('collaborativeEditor', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('collaborativeEditor');
        if (saved) {
            const data = JSON.parse(saved);
            this.editor.value = data.content;
            this.operations = data.operations || [];
            this.version = data.version || 0;
            this.updateStats();
        }
    }

    updateLastSaved() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        document.getElementById('lastSaved').textContent = 'just now';
        
        setTimeout(() => {
            document.getElementById('lastSaved').textContent = '30s ago';
        }, 30000);
    }

    addToVersionHistory(operation) {
        const historyContainer = document.querySelector('.version-history');
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item';
        versionItem.innerHTML = `
            <div class="version-author">${operation.author}</div>
            <div class="version-time">just now</div>
            <div>${operation.type === 'insert' ? 'Added text' : 'Deleted text'}</div>
        `;
        
        historyContainer.insertBefore(versionItem, historyContainer.firstChild);
        
        // Keep only last 10 versions
        const items = historyContainer.querySelectorAll('.version-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    syncWithServer() {
        // Simulate server synchronization
        console.log('Syncing with server...');
        this.updateConnectionStatus('Syncing...');
        
        setTimeout(() => {
            this.updateConnectionStatus('Connected');
            console.log('Sync complete');
        }, 1000);
    }

    handleOffline() {
        this.updateConnectionStatus('Offline');
        console.log('Working offline');
    }

    reconnect() {
        this.updateConnectionStatus('Reconnecting...');
        setTimeout(() => {
            this.isConnected = true;
            this.updateConnectionStatus('Connected');
            this.syncWithServer();
        }, 1000);
    }

    undo() {
        // Simple undo implementation
        if (this.operations.length > 0) {
            const lastOp = this.operations.pop();
            // Reverse the operation
            if (lastOp.type === 'insert') {
                const reverseOp = {
                    type: 'delete',
                    position: lastOp.position,
                    length: lastOp.content.length
                };
                this.applyOperation(reverseOp);
            }
        }
    }

    redo() {
        // Simplified redo implementation
        console.log('Redo operation');
    }
}

// Conflict Resolution System
class ConflictResolver {
    resolve(operation, existingOperations) {
        // Simple conflict resolution strategy
        // In a real implementation, this would be much more sophisticated
        
        const conflictingOps = existingOperations.filter(op => 
            Math.abs(op.position - operation.position) < 5 &&
            Math.abs(op.timestamp - operation.timestamp) < 2000
        );
        
        if (conflictingOps.length > 0) {
            // Adjust position based on existing operations
            operation.position += conflictingOps.length * 2;
        }
        
        return operation;
    }
}

// Operational Transform System
class OperationalTransform {
    transform(operation, existingOperations) {
        // Simplified operational transform
        // Real implementation would handle complex transformations
        
        let transformedOp = { ...operation };
        
        existingOperations.forEach(existingOp => {
            if (existingOp.timestamp < operation.timestamp) {
                if (existingOp.position <= transformedOp.position) {
                    if (existingOp.type === 'insert') {
                        transformedOp.position += existingOp.content.length;
                    } else if (existingOp.type === 'delete') {
                        transformedOp.position -= existingOp.length;
                    }
                }
            }
        });
        
        return transformedOp;
    }
}

// Global functions for toolbar
function formatText(format) {
    const editor = document.getElementById('editor');
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    let formattedText;
    switch(format) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        default:
            formattedText = selectedText;
    }
    
    editor.value = editor.value.substring(0, start) + formattedText + editor.value.substring(end);
    editor.setSelectionRange(start, start + formattedText.length);
    editor.focus();
}

function insertCode() {
    const editor = document.getElementById('editor');
    const start = editor.selectionStart;
    const codeBlock = '\n```javascript\n// Your code here\n```\n';
    
    editor.value = editor.value.substring(0, start) + codeBlock + editor.value.substring(start);
    editor.setSelectionRange(start + 15, start + 31);
    editor.focus();
}

function insertList() {
    const editor = document.getElementById('editor');
    const start = editor.selectionStart;
    const list = '\n- Item 1\n- Item 2\n- Item 3\n';
    
    editor.value = editor.value.substring(0, start) + list + editor.value.substring(start);
    editor.setSelectionRange(start + list.length, start + list.length);
    editor.focus();
}

function saveDocument() {
    const editor = document.getElementById('editor');
    const content = editor.value;
    
    // Create download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collaborative-document.md';
    a.click();
    URL.revokeObjectURL(url);
    
    // Update UI
    document.getElementById('lastSaved').textContent = 'just now';
    console.log('Document saved');
}

function exportDocument() {
    const editor = document.getElementById('editor');
    const content = editor.value;
    
    // Convert markdown to HTML (simplified)
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\n/g, '<br>');
    
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Exported Document</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
            </style>
        </head>
        <body>${html}</body>
        </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collaborative-document.html';
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('Document exported as HTML');
}

function loadVersion(versionId) {
    console.log(`Loading version ${versionId}`);
    // In a real implementation, this would load the specific version
    alert(`Loading version ${versionId} - This would restore the document to that state`);
}

// Initialize the collaborative editor
document.addEventListener('DOMContentLoaded', () => {
    const editor = new CollaborativeEditor();
    
    // Load saved content
    editor.loadFromLocalStorage();
    
    // Simulate some initial activity
    setTimeout(() => {
        editor.simulateRemoteOperation();
    }, 5000);
});
