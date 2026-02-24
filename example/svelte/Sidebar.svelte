<script lang="ts">
  import { chatStore, settingsStore, authStore, favoriteStore, folderStore, FAVORITE_COLORS } from "@/Store";
  import type { Conversation, UserConversationFolder } from "@/Types";
  import { formatRelativeTime, formatDateTime, truncate, getTranslations, type LanguageCode } from "@/Function";
  import { navigate } from "svelte-routing";
  import ArchiveDialog from "./ArchiveDialog.svelte";
  import ConversationSetting from "./ConversationSetting.svelte";

  // Reactive translations
  let t = $derived(getTranslations(settingsStore.language as LanguageCode));

  let { onSelectConversation }: { onSelectConversation?: (id: string) => void } = $props();
  let showArchiveModal = $state(false);
  let showSettingsModal = $state(false);
  let editingConversationId = $state<string | null>(null);
  let editingTitle = $state('');
  
  // Folder state
  let editingFolderId = $state<string | null>(null);
  let editingFolderName = $state('');
  let showFolderContextMenu = $state(false);
  let folderContextMenuPosition = $state({ x: 0, y: 0 });
  let contextMenuFolderId = $state<string | null>(null);
  let draggedConversationId = $state<string | null>(null);
  let dragOverFolderId = $state<string | null>(null);
  let showCreateFolderInput = $state(false);
  let newFolderName = $state('');
  let isFavoriteFolderCollapsed = $state(false);
  let localCollapsedFolders = $state<Record<string, boolean>>({});
  
  let archivedConversations = $derived(
    Array.isArray(chatStore.conversations) ? chatStore.conversations.filter(c => c.archived) : []
  );

  // Get favorite conversation IDs
  let favoriteConversationIds = $derived(
    favoriteStore.favorites?.favorite_conversation || []
  );

  // Get all conversation IDs that are in folders
  let conversationsInFolders = $derived.by(() => {
    const idsInFolders = new Set<string>();
    folderStore.folders.forEach(folder => {
      folder.conversation_ids.forEach(id => idsInFolders.add(id));
    });
    return idsInFolders;
  });

  // Separate favorite conversations (for favorite folder)
  let favoriteConversations = $derived.by(() => {
    if (!settingsStore.favoriteFolderEnabled) return [];
    const active = Array.isArray(chatStore.conversations) 
      ? chatStore.conversations.filter(c => !c.archived && favoriteConversationIds.includes(c.id)) 
      : [];
    return active.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  });
  
  // Sort conversations: favorites first (if not using favorite folder), then by updated_at
  // Also exclude conversations that are in folders
  let activeConversations = $derived.by(() => {
    const active = Array.isArray(chatStore.conversations) 
      ? chatStore.conversations.filter(c => !c.archived) 
      : [];
    
    // Filter out conversations in folders
    const unfolderedActive = active.filter(c => !conversationsInFolders.has(c.id));
    
    // If favorite folder is enabled, also filter out favorites from main list
    const filteredActive = settingsStore.favoriteFolderEnabled 
      ? unfolderedActive.filter(c => !favoriteConversationIds.includes(c.id))
      : unfolderedActive;
    
    return filteredActive.sort((a, b) => {
      // If favorite folder is disabled, sort favorites first
      if (!settingsStore.favoriteFolderEnabled) {
        const aIsFavorite = favoriteStore.isFavorite('conversation', a.id);
        const bIsFavorite = favoriteStore.isFavorite('conversation', b.id);
        
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
      }
      
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  });

  function handleSelect(conversation: Conversation) {
    if (onSelectConversation) {
      onSelectConversation(conversation.id);
    }
  }

  async function handleDelete(e: Event, id: string) {
    e.stopPropagation();
    if (!authStore.currentUser?.uuid) return;

    const t = getTranslations(settingsStore.language as LanguageCode);
    if (confirm(t.sidebar.deleteConfirm)) {
      await chatStore.deleteConversation(id);
    }
  }

  async function handleFavorite(e: Event, id: string) {
    e.stopPropagation();
    if (!authStore.currentUser?.uuid) return;
    
    const isFav = favoriteStore.isFavorite('conversation', id);
    try {
      if (isFav) {
        await favoriteStore.removeFromFavorite(authStore.currentUser.uuid, 'conversation', id);
      } else {
        // When adding to favorites, remove from any folder
        if (folderStore.isConversationInFolder(id)) {
          await folderStore.removeConversationFromAllFolders(authStore.currentUser.uuid, id);
        }
        await favoriteStore.addToFavorite(authStore.currentUser.uuid, 'conversation', id);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }

  async function handleArchive(e: Event, id: string) {
    e.stopPropagation();
    if (!authStore.currentUser?.uuid) return;

    await chatStore.archiveConversation(id, true);
  }

  async function handleUnarchive(id: string) {
    if (!authStore.currentUser?.uuid) return;

    await chatStore.archiveConversation(id, false);
  }

  function handleNewChat() {
    chatStore.clearCurrentConversation();
    navigate("/");
  }

  function openArchiveModal() {
    showArchiveModal = true;
  }

  function closeArchiveModal() {
    showArchiveModal = false;
  }

  function openSettingsModal() {
    showSettingsModal = true;
  }

  function closeSettingsModal() {
    showSettingsModal = false;
  }

  function startEditingTitle(conversation: Conversation) {
    editingConversationId = conversation.id;
    editingTitle = conversation.title;
  }

  function cancelEditingTitle() {
    editingConversationId = null;
    editingTitle = '';
  }

  async function saveTitle(conversationId: string) {
    if (editingTitle.trim()) {
      await chatStore.updateConversation(conversationId, { title: editingTitle.trim() });
    }
    editingConversationId = null;
    editingTitle = '';
  }

  function handleTitleKeydown(e: KeyboardEvent, conversationId: string) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle(conversationId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingTitle();
    }
  }

  function focusInput(node: HTMLInputElement) {
    node.focus();
    node.select();
  }

  // * Get the appropriate date display based on settings
  function getDateDisplay(date: string | Date): string {
    if (settingsStore.showRelativeTime) {
      return formatRelativeTime(date);
    }
    return formatDateTime(date);
  }

  // * Get favorite icon SVG based on settings
  function getFavoriteIconPath(): string {
    switch (settingsStore.favoriteIcon) {
      case 'heart':
        return 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
      case 'bookmark':
        return 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z';
      case 'pin':
        return 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z';
      default: // star
        return '';
    }
  }

  // * Get favorite color from settings
  // * Get favorite color from settings
  function getFavoriteColor(): string {
    const colorObj = FAVORITE_COLORS.find(c => c.value === settingsStore.favoriteColor);
    return colorObj?.color || '#fbbf24';
  }

  // * Handle double-click on conversation item to toggle favorite
  async function handleDoubleClick(e: MouseEvent, conversationId: string) {
    // Check if double-click favorite is enabled
    if (!settingsStore.doubleClickFavorite) return;
    // Check if user is authenticated
    if (!authStore.currentUser?.uuid) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle favorite status
    const isFav = favoriteStore.isFavorite('conversation', conversationId);
    try {
      if (isFav) {
        await favoriteStore.removeFromFavorite(authStore.currentUser.uuid, 'conversation', conversationId);
      } else {
        // When adding to favorites, remove from any folder
        if (folderStore.isConversationInFolder(conversationId)) {
          await folderStore.removeConversationFromAllFolders(authStore.currentUser.uuid, conversationId);
        }
        await favoriteStore.addToFavorite(authStore.currentUser.uuid, 'conversation', conversationId);
      }
    } catch (error) {
      console.error("Failed to toggle favorite via double-click:", error);
    }
  }

  // * Folder management functions
  async function handleCreateFolder() {
    if (!authStore.currentUser?.uuid || !newFolderName.trim()) return;
    
    try {
      await folderStore.createFolder(authStore.currentUser.uuid, {
        folder_name: newFolderName.trim()
      });
      newFolderName = '';
      showCreateFolderInput = false;
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  }

  function startEditingFolder(folder: UserConversationFolder) {
    editingFolderId = folder.id;
    editingFolderName = folder.folder_name;
  }

  function cancelEditingFolder() {
    editingFolderId = null;
    editingFolderName = '';
  }

  async function saveFolderName(folderId: string) {
    if (!authStore.currentUser?.uuid || !editingFolderName.trim()) return;
    
    try {
      await folderStore.updateFolder(authStore.currentUser.uuid, folderId, {
        folder_name: editingFolderName.trim()
      });
    } catch (error) {
      console.error("Failed to update folder:", error);
    }
    editingFolderId = null;
    editingFolderName = '';
  }

  function handleFolderNameKeydown(e: KeyboardEvent, folderId: string) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveFolderName(folderId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingFolder();
    }
  }

  async function handleDeleteFolder(folderId: string) {
    if (!authStore.currentUser?.uuid) return;
    
    const t = getTranslations(settingsStore.language as LanguageCode);
    if (confirm(t.sidebar.deleteFolderConfirm)) {
      try {
        await folderStore.deleteFolder(authStore.currentUser.uuid, folderId);
      } catch (error) {
        console.error("Failed to delete folder:", error);
      }
    }
  }

  function handleToggleFolderCollapse(folderId: string) {
    const currentCollapsed = localCollapsedFolders[folderId] ?? false;
    localCollapsedFolders[folderId] = !currentCollapsed;
  }

  // * Drag and drop handlers
  function handleDragStart(e: DragEvent, conversationId: string) {
    draggedConversationId = conversationId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', conversationId);
    }
  }

  function handleDragEnd() {
    draggedConversationId = null;
    dragOverFolderId = null;
  }

  function handleDragOver(e: DragEvent, folderId: string | null) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    dragOverFolderId = folderId;
  }

  function handleDragLeave() {
    dragOverFolderId = null;
  }

  async function handleDrop(e: DragEvent, folderId: string | null) {
    e.preventDefault();
    if (!authStore.currentUser?.uuid || !draggedConversationId) return;
    
    try {
      if (folderId) {
        // Add to folder
        await folderStore.addConversationToFolder(
          authStore.currentUser.uuid, 
          folderId, 
          draggedConversationId
        );
      } else {
        // Remove from all folders (drop in "No Folder" area)
        await folderStore.removeConversationFromAllFolders(
          authStore.currentUser.uuid,
          draggedConversationId
        );
      }
    } catch (error) {
      console.error("Failed to move conversation:", error);
    }
    
    draggedConversationId = null;
    dragOverFolderId = null;
  }

  // * Get conversations for a specific folder
  function getConversationsForFolder(folder: UserConversationFolder): Conversation[] {
    return folder.conversation_ids
      .map(id => chatStore.conversations.find(c => c.id === id))
      .filter((c): c is Conversation => c !== undefined && !c.archived)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  // * Get collapsed state for a folder (use local state, fallback to backend state)
  function getFolderCollapsed(folderId: string): boolean {
    return localCollapsedFolders[folderId] ?? false;
  }

  // * Load folders on mount
  $effect(() => {
    if (authStore.currentUser?.uuid) {
      folderStore.loadFolders(authStore.currentUser.uuid);
    }
  });
</script>

{#snippet conversationItem(conversation: Conversation, isDraggable: boolean)}
  <div
    class="conversation-item"
    class:active={chatStore.currentConversation?.id === conversation.id}
    class:dragging={draggedConversationId === conversation.id}
    draggable={isDraggable}
    ondragstart={(e) => isDraggable && handleDragStart(e, conversation.id)}
    ondragend={handleDragEnd}
    onclick={() => handleSelect(conversation)}
    ondblclick={(e) => handleDoubleClick(e, conversation.id)}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(conversation);
      }
    }}
    role="button"
    tabindex="0"
    aria-label={`Select conversation: ${conversation.title}`}
  >
    <span class="conversation-title">
      {#if favoriteStore.isFavorite('conversation', conversation.id)}
        <button
          class="title-favorite-btn"
          onclick={(e) => handleFavorite(e, conversation.id)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFavorite(e, conversation.id);
            }
          }}
          aria-label="Remove from favorites"
          title="Remove from favorites"
        >
          {#if settingsStore.favoriteIcon === 'star'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={getFavoriteColor()} stroke={getFavoriteColor()} stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={getFavoriteColor()} stroke={getFavoriteColor()} stroke-width="2">
              <path d={getFavoriteIconPath()}></path>
            </svg>
          {/if}
        </button>
      {/if}
      {#if editingConversationId === conversation.id}
        <input
          type="text"
          class="title-input"
          bind:value={editingTitle}
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => handleTitleKeydown(e, conversation.id)}
          onblur={() => saveTitle(conversation.id)}
          use:focusInput
        />
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span
          class="title-text"
          class:clickable={!settingsStore.disableClickRename}
          onclick={(e) => {
            e.stopPropagation();
            if (!settingsStore.disableClickRename && chatStore.currentConversation?.id === conversation.id) {
              startEditingTitle(conversation);
            } else {
              handleSelect(conversation);
            }
          }}
        >
          {truncate(conversation.title, 25)}
        </span>
      {/if}
    </span>
    <span class="conversation-date">{getDateDisplay(conversation.updated_at)}</span>
    <div class="conversation-actions">
      {#if !favoriteStore.isFavorite('conversation', conversation.id)}
        <button
          class="action-btn favorite-btn"
          onclick={(e) => handleFavorite(e, conversation.id)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFavorite(e, conversation.id);
            }
          }}
          aria-label="Add to favorites"
          title="Add to favorites"
        >
          {#if settingsStore.favoriteIcon === 'star'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d={getFavoriteIconPath()}></path>
            </svg>
          {/if}
        </button>
      {/if}
      <button
        class="action-btn archive-btn"
        onclick={(e) => handleArchive(e, conversation.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleArchive(e, conversation.id);
          }
        }}
        aria-label="Archive conversation"
        title="Archive conversation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <line x1="1" y1="3" x2="23" y2="3"></line>
          <path d="M10 12v6"></path>
          <path d="M14 12v6"></path>
        </svg>
      </button>
      <button
        class="action-btn delete-btn"
        onclick={(e) => handleDelete(e, conversation.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDelete(e, conversation.id);
          }
        }}
        aria-label="Delete conversation"
        title="Delete conversation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
{/snippet}

<aside class="sidebar" class:collapsed={!settingsStore.sidebarOpen}>
  <div class="sidebar-header">
    <button class="new-chat-btn" onclick={handleNewChat}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      {t.sidebar.newChat}
    </button>
    <button class="toggle-btn" onclick={() => settingsStore.toggleSidebar()}>
      {#if settingsStore.sidebarOpen}
        <!-- Collapse icon (chevron left) -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      {:else}
        <!-- Expand icon (chevron right) -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      {/if}
    </button>
  </div>

  <div class="conversations-list">
    {#if !authStore.isAuthenticated}
      <div class="auth-prompt">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <p class="auth-message">{t.sidebar.loginToSave}</p>
        <p class="auth-submessage">{t.sidebar.canChatWithoutAccount}</p>
      </div>
    {:else if chatStore.isLoading}
      <div class="loading">{t.sidebar.loadingConversations}</div>
    {:else if activeConversations.length === 0 && folderStore.folders.length === 0 && favoriteConversations.length === 0}
      <div class="empty">{t.sidebar.noConversations}</div>
    {:else}
      <!-- Favorites Folder (when enabled) -->
      {#if settingsStore.favoriteFolderEnabled && favoriteConversations.length > 0}
        <div class="folder-section favorites-folder">
          <div class="folder-header">
            <button class="folder-toggle" onclick={() => { isFavoriteFolderCollapsed = !isFavoriteFolderCollapsed; }}>
              <svg class="chevron" class:collapsed={isFavoriteFolderCollapsed} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span class="favorite-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={getFavoriteColor()} stroke={getFavoriteColor()} stroke-width="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
              <span class="folder-name favorites-name">{t.sidebar.favorites}</span>
              <span class="folder-count favorites-count">{favoriteConversations.length}</span>
            </button>
          </div>
          {#if !isFavoriteFolderCollapsed}
            <div class="folder-contents">
              {#each favoriteConversations as conversation (conversation.id)}
                {@render conversationItem(conversation, false)}
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- User Folders -->
      {#each folderStore.folders as folder (folder.id)}
        {@const folderConversations = getConversationsForFolder(folder)}
        {@const isCollapsed = getFolderCollapsed(folder.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          class="folder-section user-folder"
          class:drag-over={dragOverFolderId === folder.id}
          ondragover={(e) => handleDragOver(e, folder.id)}
          ondragleave={handleDragLeave}
          ondrop={(e) => handleDrop(e, folder.id)}
          role="region"
        >
          <div class="folder-header">
            <button class="folder-toggle" onclick={() => handleToggleFolderCollapse(folder.id)}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                class="chevron"
                class:collapsed={isCollapsed}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              {#if editingFolderId === folder.id}
                <input
                  type="text"
                  class="folder-name-input"
                  bind:value={editingFolderName}
                  onclick={(e) => e.stopPropagation()}
                  onkeydown={(e) => handleFolderNameKeydown(e, folder.id)}
                  onblur={() => saveFolderName(folder.id)}
                  use:focusInput
                />
              {:else}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span 
                  class="folder-name"
                  class:clickable={!settingsStore.disableFolderClickRename}
                  onclick={(e) => {
                    e.stopPropagation();
                    if (settingsStore.disableFolderClickRename) {
                      handleToggleFolderCollapse(folder.id);
                    } else {
                      startEditingFolder(folder);
                    }
                  }}
                  ondblclick={(e) => {
                    if (settingsStore.disableFolderClickRename) return;
                    e.stopPropagation();
                    startEditingFolder(folder);
                  }}
                >{folder.folder_name}</span>
              {/if}
            </button>
            <div class="folder-actions">
              <button 
                class="folder-action-btn"
                onclick={(e) => {
                  e.stopPropagation();
                  startEditingFolder(folder);
                }}
                title={t.sidebar.renameFolder}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                class="folder-action-btn delete"
                onclick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
                title={t.sidebar.deleteFolder}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <span class="folder-count">{folderConversations.length}</span>
          </div>
          {#if !isCollapsed}
            <div class="folder-contents">
              {#each folderConversations as conversation (conversation.id)}
                {@render conversationItem(conversation, true)}
              {/each}
              {#if folderConversations.length === 0}
                <div class="folder-empty">Drop conversations here</div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Create Folder Button/Input -->
      {#if showCreateFolderInput}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <div class="create-folder-input">
          <input
            type="text"
            placeholder={t.sidebar.folderName}
            bind:value={newFolderName}
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateFolder();
              } else if (e.key === 'Escape') {
                showCreateFolderInput = false;
                newFolderName = '';
              }
            }}
            use:focusInput
          />
          <button class="create-folder-confirm" onclick={handleCreateFolder} aria-label="Confirm create folder">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button class="create-folder-cancel" onclick={() => { showCreateFolderInput = false; newFolderName = ''; }} aria-label="Cancel create folder">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      {:else}
        <button class="create-folder-btn" onclick={() => showCreateFolderInput = true}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
          {t.sidebar.newFolder}
        </button>
      {/if}

      <!-- Unfiled Conversations -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        class="unfiled-section"
        class:drag-over={dragOverFolderId === null && draggedConversationId !== null}
        ondragover={(e) => handleDragOver(e, null)}
        ondragleave={handleDragLeave}
        ondrop={(e) => handleDrop(e, null)}
        role="region"
      >
        {#each activeConversations as conversation (conversation.id)}
          {@render conversationItem(conversation, true)}
        {/each}
      </div>
    {/if}
    
    <!-- {#if authStore.isAuthenticated && archivedConversations.length > 0}
      <button class="view-archive-btn" onclick={openArchiveModal}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <line x1="1" y1="3" x2="23" y2="3"></line>
          <path d="M10 12v6"></path>
          <path d="M14 12v6"></path>
        </svg>
        View Archive ({archivedConversations.length})
      </button>
    {/if} -->
  </div>

  <div class="sidebar-footer">
    <button class="archiveSetting-btn" onclick={openArchiveModal}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="21 8 21 21 3 21 3 8"></polyline>
        <line x1="1" y1="3" x2="23" y2="3"></line>
        <path d="M10 12v6"></path>
        <path d="M14 12v6"></path>
      </svg>
      {t.sidebar.archive}
    </button>
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button class="settings-btn" onclick={openSettingsModal}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </div>
</aside>

<!-- Archive Modal -->
<ArchiveDialog
  isOpen={showArchiveModal}
  archivedConversations={archivedConversations}
  onClose={closeArchiveModal}
/>

<!-- Settings Modal -->
<ConversationSetting
  isOpen={showSettingsModal}
  onClose={closeSettingsModal}
/>

<style>
  .sidebar {
    width: 260px;
    height: 100%;
    background: var(--sidebar-bg, #1a1a1a);
    border-right: 1px solid var(--border-color, #2d2d2d);
    display: flex;
    flex-direction: column;
    transition: width 0.2s ease;
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 0px;
    border-right: none;
  }

  .sidebar.collapsed .sidebar-header {
    display: none;
  }

  .sidebar.collapsed .new-chat-btn {
    display: none;
  }

  .sidebar.collapsed .toggle-btn {
    display: none;
  }

  .sidebar.collapsed .conversations-list {
    display: none;
  }

  .sidebar.collapsed .sidebar-footer {
    display: none;
  }

  .sidebar-header {
    padding: 12px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--border-color, #2d2d2d);
  }

  .new-chat-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--primary-color, #6366f1);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .new-chat-btn:hover {
    background: var(--primary-hover, #5558e6);
  }

  .toggle-btn {
    padding: 10px;
    background: transparent;
    border: 1px solid var(--border-color, #2d2d2d);
    border-radius: 8px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-btn:hover {
    background: var(--hover-bg, #2d2d2d);
    color: var(--text-primary, #fff);
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .loading,
  .empty {
    text-align: center;
    padding: 24px 16px;
    color: var(--text-secondary, #888);
    font-size: 14px;
    margin: auto;
  }

  .conversation-item {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    margin-bottom: 4px;
    transition: background 0.2s;
    position: relative;
  }

  .conversation-item:hover {
    background: var(--hover-bg, #2d2d2d);
  }

  .conversation-item.active {
    background: var(--active-bg, #3d3d3d);
  }

  .conversation-title {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary, #fff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .title-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: default;
  }

  .title-text.clickable {
    cursor: pointer;
  }

  .title-text.clickable:hover {
    text-decoration: underline;
  }

  .title-input {
    width: auto;
    max-width: 200px;
    background: var(--input-bg, #1a1a1a);
    border: 1px solid var(--border-color, #3d3d3d);
    border-radius: 4px;
    color: var(--text-primary, #fff);
    font-size: 14px;
    padding: 2px 6px;
    outline: none;
  }

  .title-input:focus {
    border-color: var(--primary-color, #6366f1);
  }

  .conversation-date {
    font-size: 11px;
    color: var(--text-secondary, #888);
    width: 100%;
  }

  .conversation-actions {
    display: flex;
    gap: 4px;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
  }

  .conversation-item:hover .conversation-actions {
    opacity: 1;
  }

  .action-btn {
    padding: 6px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: var(--hover-bg, #3d3d3d);
  }

  .title-favorite-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 5px;
    margin-right: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    transition: all 0.2s;
  }

  .title-favorite-btn:hover {
    transform: scale(1.1);
  }

  .favorite-btn {
    color: #888;
  }

  .favorite-btn:hover {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }

  .archive-btn:hover {
    background: var(--warning-bg, rgba(59, 130, 246, 0.2));
    color: var(--warning-color, #3b82f6);
  }

  .delete-btn:hover {
    background: var(--danger-bg, rgba(239, 68, 68, 0.2));
    color: var(--danger-color, #ef4444);
  }


  .sidebar-footer {
    padding: 12px;
    border-top: 1px solid var(--border-color, #2d2d2d);
    display: flex;
    gap: 8px;
  }


  .archiveSetting-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: transparent;
    border: 1px solid var(--border-color, #2d2d2d);
    border-radius: 8px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .archiveSetting-btn:hover {
    background: var(--hover-bg, #2d2d2d);
    color: var(--text-primary, #fff);
  }

  .settings-btn {
    padding: 10px;
    background: transparent;
    border: 1px solid var(--border-color, #2d2d2d);
    border-radius: 8px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .settings-btn:hover {
    background: var(--hover-bg, #2d2d2d);
    color: var(--text-primary, #fff);
  }

  .auth-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--text-muted, #888);
  }

  .auth-prompt svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .auth-message {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--text-secondary, #aaa);
  }

  .auth-submessage {
    font-size: 12px;
    opacity: 0.7;
  }

  /* Folder Styles */
  .folder-section {
    margin-bottom: 4px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .folder-section.drag-over {
    background: var(--hover-bg, #2d2d2d);
    outline: 2px dashed var(--primary-color, #6366f1);
  }

  .folder-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 8px;
    border: 1px solid var(--border-color, #2d2d2d);
    transition: background 0.2s;
  }

  .folder-header:hover {
    background: var(--hover-bg, #2d2d2d);
  }

  .folder-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--text-primary, #fff);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    padding: 0;
    flex: 1;
    text-align: left;
  }

  .folder-toggle .chevron {
    transition: transform 0.2s;
  }

  .folder-toggle .chevron.collapsed {
    transform: rotate(-90deg);
  }

  .folder-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .folder-name.clickable {
    cursor: pointer;
  }

  .folder-name.clickable:hover {
    text-decoration: underline;
  }

  .folder-count {
    font-size: 11px;
    color: var(--text-primary, #fff);
    margin-left: 8px;
    background: rgba(99, 102, 241, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    flex-shrink: 0;
    order: 3;
  }

  .folder-name-input {
    flex: 1;
    background: var(--input-bg, #1a1a1a);
    border: 1px solid var(--border-color, #3d3d3d);
    border-radius: 4px;
    color: var(--text-primary, #fff);
    font-size: 13px;
    padding: 2px 6px;
    outline: none;
    max-width: 140px;
  }

  .folder-name-input:focus {
    border-color: var(--primary-color, #6366f1);
  }

  .folder-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    order: 2;
    margin-left: auto;
  }

  .folder-header:hover .folder-actions {
    opacity: 1;
  }

  .folder-action-btn {
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .folder-action-btn:hover {
    background: var(--hover-bg, #3d3d3d);
    color: var(--text-primary, #fff);
  }

  .folder-action-btn.delete:hover {
    background: var(--danger-bg, rgba(239, 68, 68, 0.2));
    color: var(--danger-color, #ef4444);
  }

  .folder-contents {
    padding-left: 20px;
  }

  .user-folder .folder-contents {
    padding-top: 4px;
    border-left: 2px solid var(--border-color, rgba(99, 102, 241, 0.3));
    margin-left: 18px;
    padding-left: 10px;
  }

  .folder-empty {
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-muted, #666);
    font-style: italic;
  }

  .favorites-folder {
    margin-bottom: 8px;
    border-radius: 10px;
    overflow: hidden;
  }

  .favorites-folder .folder-header {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%);
    border: 1px solid rgba(251, 191, 36, 0.15);
    border-radius: 10px;
    margin: 0;
  }

  .favorites-folder .folder-header:hover {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%);
    border-color: rgba(251, 191, 36, 0.25);
  }

  .favorites-folder .folder-toggle {
    padding: 10px 12px;
  }

  .favorite-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4));
  }

  .favorites-name {
    color: var(--text-primary, #fff);
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .favorites-count {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-left: auto;
  }

  .favorites-folder .folder-contents {
    padding-top: 4px;
    border-left: 2px solid rgba(251, 191, 36, 0.2);
    margin-left: 18px;
    padding-left: 10px;
  }

  /* Create Folder */
  .create-folder-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: 1px dashed var(--border-color, #3d3d3d);
    border-radius: 8px;
    color: var(--text-secondary, #888);
    cursor: pointer;
    font-size: 13px;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .create-folder-btn:hover {
    background: var(--hover-bg, #2d2d2d);
    border-color: var(--primary-color, #6366f1);
    color: var(--text-primary, #fff);
  }

  .create-folder-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-secondary, #1a1a1a);
    border: 1px solid var(--primary-color, #6366f1);
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .create-folder-input input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary, #fff);
    font-size: 13px;
    outline: none;
  }

  .create-folder-confirm,
  .create-folder-cancel {
    padding: 4px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .create-folder-confirm {
    color: var(--success-color, #22c55e);
  }

  .create-folder-confirm:hover {
    background: rgba(34, 197, 94, 0.2);
  }

  .create-folder-cancel {
    color: var(--danger-color, #ef4444);
  }

  .create-folder-cancel:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  /* Unfiled Section */
  .unfiled-section {
    min-height: 40px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .unfiled-section.drag-over {
    background: var(--hover-bg, #2d2d2d);
    outline: 2px dashed var(--border-color, #3d3d3d);
  }

  /* Dragging States */
  .conversation-item.dragging {
    opacity: 0.5;
  }
</style>
