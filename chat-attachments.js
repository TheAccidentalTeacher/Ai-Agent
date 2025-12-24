// Phase 11 Week 1: Chat Document Attachments (Monica-style)
// Allows attaching multiple documents to chat conversations

import { supabase } from './supabase-client.js';

// Global state
let attachedDocuments = []; // Documents attached to current conversation
let availableDocuments = []; // User's uploaded documents
let currentConversationId = null;

/**
 * Initialize document attachment functionality
 */
export function initChatAttachments() {
  // console.log('📎 [Attachments] Initializing chat document attachments');
  
  // Get current conversation ID (from session or generate new one)
  currentConversationId = sessionStorage.getItem('conversationId') || generateConversationId();
  sessionStorage.setItem('conversationId', currentConversationId);
  
  // Load previously attached documents for this conversation
  loadConversationDocuments();
  
  // Set up event listeners
  setupEventListeners();
}

/**
 * Generate a unique conversation ID
 */
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const attachBtn = document.getElementById('attach-document-btn');
  const docInput = document.getElementById('document-input');
  const modal = document.getElementById('document-picker-modal');
  const closeBtn = document.getElementById('close-document-picker');
  const cancelBtn = document.getElementById('cancel-document-picker');
  const attachSelectedBtn = document.getElementById('attach-selected-documents');
  
  // Phase 11 Week 2: Direct file upload (trigger file input)
  if (attachBtn && docInput) {
    attachBtn.addEventListener('click', () => {
      console.log('📎 [Attachments] Opening file picker (Week 2 mode)');
      docInput.click();
    });
  } else {
    // Fallback to modal picker if document-input doesn't exist
    attachBtn?.addEventListener('click', openDocumentPicker);
  }
  
  // Close modal
  closeBtn?.addEventListener('click', closeDocumentPicker);
  cancelBtn?.addEventListener('click', closeDocumentPicker);
  
  // Attach selected documents
  attachSelectedBtn?.addEventListener('click', attachSelectedDocuments);
  
  // Close on outside click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeDocumentPicker();
    }
  });
}

/**
 * Open document picker modal
 */
async function openDocumentPicker() {
  console.log('📎 [Attachments] Opening document picker');
  
  // Load user's documents
  await loadUserDocuments();
  
  // Render document list
  renderDocumentPicker();
  
  // Show modal
  const modal = document.getElementById('document-picker-modal');
  modal.style.display = 'flex';
}

/**
 * Close document picker modal
 */
function closeDocumentPicker() {
  const modal = document.getElementById('document-picker-modal');
  modal.style.display = 'none';
}

/**
 * Load user's uploaded documents
 */
async function loadUserDocuments() {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;
    
    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    availableDocuments = data || [];
    console.log('📄 [Attachments] Loaded documents:', availableDocuments.length);
    
  } catch (error) {
    console.error('❌ [Attachments] Error loading documents:', error);
  }
}

/**
 * Render document picker list
 */
function renderDocumentPicker() {
  const listContainer = document.getElementById('document-picker-list');
  const emptyState = document.getElementById('document-picker-empty');
  
  if (availableDocuments.length === 0) {
    emptyState.style.display = 'block';
    listContainer.innerHTML = '';
    listContainer.appendChild(emptyState);
    return;
  }
  
  emptyState.style.display = 'none';
  
  // Create document list with checkboxes
  listContainer.innerHTML = availableDocuments.map(doc => {
    const isAttached = attachedDocuments.some(d => d.id === doc.id);
    const isCompleted = doc.processing_status === 'completed';
    const isProcessing = doc.processing_status === 'processing';
    const isPending = doc.processing_status === 'pending';
    const isError = doc.processing_status === 'error';
    
    let statusBadge = '';
    if (!isCompleted) {
      if (isProcessing) {
        statusBadge = '<span style="color: #3b82f6; font-size: 11px; background: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: 4px; margin-left: 8px;">\u26a1 Processing...</span>';
      } else if (isPending) {
        statusBadge = '<span style="color: #f59e0b; font-size: 11px; background: rgba(245, 158, 11, 0.1); padding: 2px 8px; border-radius: 4px; margin-left: 8px;">\u23f3 Pending</span>';
      } else if (isError) {
        statusBadge = '<span style="color: #ef4444; font-size: 11px; background: rgba(239, 68, 68, 0.1); padding: 2px 8px; border-radius: 4px; margin-left: 8px;">\u274c Error</span>';
      }
    }
    
    const canAttach = isCompleted && !isAttached;
    
    return `
      <div class="document-picker-item" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        margin-bottom: 8px;
        cursor: ${canAttach ? 'pointer' : 'not-allowed'};
        ${!canAttach ? 'opacity: 0.5;' : ''}
      " data-doc-id="${doc.id}">
        <input type="checkbox" 
          class="doc-picker-checkbox" 
          data-doc-id="${doc.id}"
          ${!canAttach ? 'disabled' : ''} 
          ${isAttached ? 'checked' : ''}
          style="cursor: ${canAttach ? 'pointer' : 'not-allowed'};">
        <div style="font-size: 24px;">${getFileIcon(doc.file_type)}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 14px; color: var(--text-primary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${doc.filename}${statusBadge}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            ${doc.word_count ? doc.word_count.toLocaleString() + ' words' : ''} ${doc.word_count && doc.page_count ? '\u2022' : ''} ${doc.page_count ? doc.page_count + ' pages' : ''}
          </div>
        </div>
        ${isAttached ? '<span style="color: #10b981; font-size: 12px;">\u2713 Attached</span>' : ''}
        ${!isCompleted && !isAttached ? '<span style="color: #9ca3af; font-size: 11px;">Not ready</span>' : ''}
      </div>
    `;
  }).join('');
  
  // Add click handlers
  listContainer.querySelectorAll('.document-picker-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const checkbox = item.querySelector('.doc-picker-checkbox');
      if (!checkbox.disabled) {
        checkbox.checked = !checkbox.checked;
      }
    });
  });
}

/**
 * Attach selected documents
 */
async function attachSelectedDocuments() {
  const checkboxes = document.querySelectorAll('.doc-picker-checkbox:checked:not(:disabled)');
  const selectedIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-doc-id'));
  
  if (selectedIds.length === 0) {
    closeDocumentPicker();
    return;
  }
  
  console.log('📎 [Attachments] Attaching documents:', selectedIds);
  
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;
    
    // Insert into conversation_documents table
    const inserts = selectedIds.map(docId => ({
      conversation_id: currentConversationId,
      document_id: docId,
      user_id: user.data.user.id
    }));
    
    const { error } = await supabase
      .from('conversation_documents')
      .insert(inserts);
    
    if (error) throw error;
    
    // Add to attached documents
    const newDocs = availableDocuments.filter(doc => selectedIds.includes(doc.id));
    attachedDocuments.push(...newDocs);
    
    // Update UI
    renderAttachedDocuments();
    
    closeDocumentPicker();
    
    console.log('✅ [Attachments] Documents attached:', attachedDocuments.length);
    
  } catch (error) {
    console.error('❌ [Attachments] Error attaching documents:', error);
    alert('Failed to attach documents. They may already be attached.');
  }
}

/**
 * Load documents attached to current conversation
 */
async function loadConversationDocuments() {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;
    
    const { data, error } = await supabase
      .from('conversation_documents')
      .select(`
        document_id,
        user_documents (*)
      `)
      .eq('conversation_id', currentConversationId)
      .eq('user_id', user.data.user.id);
    
    if (error) throw error;
    
    attachedDocuments = data?.map(item => item.user_documents) || [];
    
    // console.log('📎 [Attachments] Loaded conversation documents:', attachedDocuments.length);
    
    // Update UI
    renderAttachedDocuments();
    
  } catch (error) {
    console.error('❌ [Attachments] Error loading conversation documents:', error);
  }
}

/**
 * Render attached documents in chat UI
 */
function renderAttachedDocuments() {
  const container = document.getElementById('chat-attachments');
  
  if (attachedDocuments.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';
  container.innerHTML = attachedDocuments.map(doc => `
    <div class="attached-doc-chip" style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: var(--accent-color);
      color: white;
      border-radius: 12px;
      font-size: 12px;
      white-space: nowrap;
    ">
      <span>${getFileIcon(doc.file_type)}</span>
      <span style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${doc.filename}</span>
      <button class="remove-doc-btn" data-doc-id="${doc.id}" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        font-size: 14px;
        line-height: 1;
      " title="Remove">×</button>
    </div>
  `).join('');
  
  // Add remove handlers
  container.querySelectorAll('.remove-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-doc-id');
      removeAttachedDocument(docId);
    });
  });
}

/**
 * Remove attached document
 */
async function removeAttachedDocument(docId) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;
    
    const { error } = await supabase
      .from('conversation_documents')
      .delete()
      .eq('conversation_id', currentConversationId)
      .eq('document_id', docId)
      .eq('user_id', user.data.user.id);
    
    if (error) throw error;
    
    // Remove from local array
    attachedDocuments = attachedDocuments.filter(doc => doc.id !== docId);
    
    // Update UI
    renderAttachedDocuments();
    
    console.log('✅ [Attachments] Document removed');
    
  } catch (error) {
    console.error('❌ [Attachments] Error removing document:', error);
  }
}

/**
 * Get attached documents for chat context
 */
export function getAttachedDocuments() {
  return attachedDocuments;
}

/**
 * Get conversation ID
 */
export function getConversationId() {
  return currentConversationId;
}

/**
 * Clear conversation (start new chat)
 */
export function clearConversation() {
  currentConversationId = generateConversationId();
  sessionStorage.setItem('conversationId', currentConversationId);
  attachedDocuments = [];
  renderAttachedDocuments();
  console.log('🔄 [Attachments] Conversation cleared, new ID:', currentConversationId);
}

/**
 * Get file icon based on type
 */
function getFileIcon(fileType) {
  if (fileType.includes('pdf')) return '📕';
  if (fileType.includes('word') || fileType.includes('docx')) return '📘';
  if (fileType.includes('text') || fileType.includes('txt')) return '📄';
  if (fileType.includes('epub')) return '📙';
  return '📄';
}

// Export for use in app-init.js
window.initChatAttachments = initChatAttachments;
window.getAttachedDocuments = getAttachedDocuments;
window.clearConversation = clearConversation;
window.getCurrentConversationId = () => currentConversationId;
