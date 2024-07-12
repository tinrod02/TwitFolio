document.addEventListener('DOMContentLoaded', function () {
    const tweetForm = document.getElementById('tweetForm');
    const tweetInput = document.getElementById('tweetInput');
    const postsContainer = document.getElementById('postsContainer');
    const homeButton = document.getElementById('homeButton');
    const exploreButton = document.getElementById('exploreButton');
    const notificationsButton = document.getElementById('notificationsButton');
    const feedSection = document.getElementById('feed');
    const exploreSection = document.getElementById('exploreSection');
    const notificationsSection = document.getElementById('notificationsSection');
    const notificationItemsContainer = document.getElementById('notificationItemsContainer');
    const notificationCountElement = document.getElementById('notificationCount');
    const messagesButton = document.getElementById('messagesButton');
    const chatSection = document.getElementById('chatSection');
    const chatUserName = document.getElementById('chatUserName');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messagesContainer');
    const searchBar = document.getElementById('searchBar');
    const chatSearchInput = document.getElementById('chatSearchInput');
    const chatSuggestions = document.getElementById('chatSuggestions');
    const bookmarksButton = document.getElementById('bookmarksButton'); 
    const bookmarksSection = document.getElementById('bookmarksSection');
    const bookmarksContainer = document.getElementById('bookmarksContainer'); 
    const profileButton = document.getElementById('profileButton'); 
    const profileSection = document.getElementById('profileSection');

    let currentChatUser = null;
    let notificationCount = 0;

    // Event listeners
    messagesButton.addEventListener('click', () => displaySection('chat'));
    homeButton.addEventListener('click', () => displaySection('feed'));
    exploreButton.addEventListener('click', () => {
        displaySection('explore');
        feedSection.style.display = 'block';
    });
    notificationsButton.addEventListener('click', () => displaySection('notifications'));
    bookmarksButton.addEventListener('click', () => displaySection('bookmarks'));
    profileButton.addEventListener('click', () => displaySection('profile')); 
    messageForm.addEventListener('submit', sendMessage);
    tweetForm.addEventListener('submit', createTweet);
    tweetInput.addEventListener('input', toggleTweetButton);
    messageInput.addEventListener('keydown', handleEnterKey);
    searchBar.addEventListener('input', filterPosts);
    chatSearchInput.addEventListener('input', searchChat);

    // Initialize on load
    populateChatList();
    hideScrollbar();

    // Directly display the 'feed' section on load
    displaySection('feed');
    loadBookmarks(); 

    // Functions

    function displaySection(section) {
        hideAllSections();
        switch (section) {
            case 'feed':
                feedSection.style.display = 'block';
                feedSection.style.overflowY = 'auto';
                break;
            case 'explore':
                exploreSection.style.display = 'block';
                feedSection.style.display = 'block';
                feedSection.style.overflowY = 'auto';
                break;
            case 'notifications':
                notificationsSection.style.display = 'block';
                feedSection.style.overflowY = 'hidden';
                break;
            case 'chat':
                chatSection.style.display = 'block';
                feedSection.style.overflowY = 'hidden';
                break;
            case 'profile':
                if (isProfileUnderMaintenance()) {
                    alert('Profile section is under maintenance. Sorry for the inconvenience.');
                }
                profileSection.style.display = 'block';
                break;
            case 'bookmarks':
                bookmarksSection.style.display = 'block';
                break;
            default:
                break;
        }
        updateChatUserName(section);
        localStorage.setItem('lastSection', section);
    }

    function isProfileUnderMaintenance() {
        return true;
    }

    function hideAllSections() {
        feedSection.style.display = 'none';
        exploreSection.style.display = 'none';
        notificationsSection.style.display = 'none';
        chatSection.style.display = 'none';
        bookmarksSection.style.display = 'none';
        profileSection.style.display = 'none'; 
    }

    function updateChatUserName(section) {
        chatUserName.textContent = (section === 'chat' && currentChatUser) ? currentChatUser : 'Chat with User';
    }

    function populateChatList() {
        const followers = ["Bianca Sophia Roxas", "Nicole Patrice Torrero", "Francis Raven Salamo", "Gizelle Rada"];
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        followers.forEach(follower => {
            const chatItem = document.createElement('div');
            chatItem.textContent = follower;
            chatItem.classList.add('chat-item');
            chatItem.addEventListener('click', () => startChat(follower));
            chatList.appendChild(chatItem);
        });
    }

    function startChat(user) {
        currentChatUser = user;
        messagesContainer.innerHTML = '';
        const messages = JSON.parse(localStorage.getItem(`chat_${user}`)) || [];
        messages.forEach((msg, index) => {
            displayMessage(msg.sender, msg.text, index === messages.length - 1, msg.id);
        });
        updateChatUserName('chat');
    }

    function displayMessage(sender, text, isLast = false, id) {
        const message = document.createElement('div');
        message.classList.add('message');
        message.id = id;
        message.classList.add(sender === 'You' ? 'sent-message' : 'received-message');
        const senderElem = document.createElement('div');
        senderElem.classList.add('sender');
        senderElem.textContent = sender === 'You' ? `You:` : `${sender}:`;
        const textElem = document.createElement('div');
        textElem.textContent = text;
        message.addEventListener('click', () => toggleActions(message));
        message.appendChild(senderElem);
        message.appendChild(textElem);
        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function toggleActions(message) {
        const actionsContainer = message.querySelector('.message-actions');
        if (actionsContainer) {
            actionsContainer.style.display = actionsContainer.style.display === 'none' ? 'block' : 'none';
        } else {
            showActions(message);
        }
    }

    function showActions(message) {
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('message-actions');
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit fa-sm"></i>';
        editButton.addEventListener('click', (e) => editMessage(e, message));
        actionsContainer.appendChild(editButton);
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt fa-sm"></i>';
        deleteButton.addEventListener('click', (e) => deleteMessage(e, message));
        actionsContainer.appendChild(deleteButton);
        message.appendChild(actionsContainer);
    }

    function editMessage(event, message) {
        event.stopPropagation();
        const textElement = message.querySelector('.message > div:nth-child(2)');
        if (!textElement) return;
        const newText = prompt('Edit your message:', textElement.textContent);
        if (newText !== null) {
            textElement.textContent = newText;
            const messageId = message.id;
            const messages = JSON.parse(localStorage.getItem(`chat_${currentChatUser}`)) || [];
            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                messages[messageIndex].text = newText;
                localStorage.setItem(`chat_${currentChatUser}`, JSON.stringify(messages));
            }
        }
    }

    function deleteMessage(event, message) {
        event.stopPropagation();
        message.remove();
        const messageId = message.id;
        const messages = JSON.parse(localStorage.getItem(`chat_${currentChatUser}`)) || [];
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        localStorage.setItem(`chat_${currentChatUser}`, JSON.stringify(updatedMessages));
    }

    function sendMessage(e) {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText === '' || !currentChatUser) return;
        const messageId = new Date().getTime().toString();
        displayMessage('You', messageText, true, messageId);
        const messages = JSON.parse(localStorage.getItem(`chat_${currentChatUser}`)) || [];
        messages.push({ id: messageId, sender: 'You', text: messageText });
        localStorage.setItem(`chat_${currentChatUser}`, JSON.stringify(messages));
        messageInput.value = '';
    }

    function createTweet(e) {
        e.preventDefault();
        const tweetText = tweetInput.value.trim();
        if (tweetText === '') return;
        const newPost = createPost(tweetText);
        postsContainer.insertBefore(newPost, postsContainer.firstChild);
        tweetInput.value = '';
        toggleTweetButton();
    }

    function toggleTweetButton() {
        const tweetButton = tweetForm.querySelector('button[type="submit"]');
        tweetButton.disabled = tweetInput.value.trim() === '';
    }

    function updateCount(element) {
        const count = parseInt(element.textContent) + 1;
        element.textContent = count;
    }

    function addNotification(postContent, action, reactor) {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notificationItem';

        if (reactor === getCurrentUser()) {
            notificationItem.textContent = `You ${action} your post: "${postContent}"`;
        } else {
            notificationItem.textContent = `${reactor ? reactor : 'Someone'} ${action} your post: "${postContent}"`;
        }

        notificationItemsContainer.appendChild(notificationItem);
        updateNotificationCount();
    }

    function updateNotificationCount() {
        notificationCountElement.textContent = ++notificationCount;
    }

    function getCurrentUser() {
        return 'You'; 
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createPost(content) {
        const retweets = getRandomNumber(0, 100);
        const likes = getRandomNumber(0, 500);
        const shares = getRandomNumber(0, 200);

        const newPost = document.createElement('div');
        newPost.className = 'post';
        newPost.innerHTML = `
            <div class="post__avatar">
                <img src="https://i.pinimg.com/originals/a6/58/32/a65832155622ac173337874f02b218fb.png" alt=""/>
            </div>
            <div class="post__body">
                <div class="post__header">
                    <div class="post__headerText">
                        <h3>
                            Cristina Gail Rodelas
                            <span class="post__headerSpecial">
                                <span class="material-symbols-outlined">verified</span>@tinarod
                            </span>
                        </h3>
                    </div>
                    <div class="post__headerDescription">
                        <p>${content}</p>
                    </div>
                </div>
                <div class="post__footer">
                    <span class="material-symbols-outlined post-action retweet">repeat</span>
                    <span class="retweet-count">${retweets}</span>
                    <span class="material-symbols-outlined post-action like">favorite</span>
                    <span class="like-count">${likes}</span>
                    <span class="material-symbols-outlined post-action share">publish</span>
                    <span class="share-count">${shares}</span>
                    <button class="bookmarkButton">
                        <i class="fas fa-bookmark"></i>
                    </button>
                    <button class="deleteButton">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        newPost.querySelector('.retweet').addEventListener('click', function () {
            updateCount(newPost.querySelector('.retweet-count'));
            addNotification(content, 'retweeted', getCurrentUser());
        });

        newPost.querySelector('.like').addEventListener('click', function () {
            updateCount(newPost.querySelector('.like-count'));
            addNotification(content, 'liked', getCurrentUser());
        });

        newPost.querySelector('.share').addEventListener('click', function () {
            updateCount(newPost.querySelector('.share-count'));
            addNotification(content, 'shared', getCurrentUser());
        });

        newPost.querySelector('.deleteButton').addEventListener('click', function () {
            newPost.remove();
        });

        newPost.querySelector('.bookmarkButton').addEventListener('click', function () {
            toggleBookmark(newPost);
        });


        return newPost;
    }

    function filterPosts() {
        const query = searchBar.value.toLowerCase();
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
            const text = post.querySelector('.post-content p').textContent.toLowerCase();
            post.style.display = text.includes(query) ? 'block' : 'none';
        });
    }

    function searchChat() {
        const query = chatSearchInput.value.toLowerCase();
        const suggestions = followers.filter(follower => follower.toLowerCase().includes(query));
        chatSuggestions.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = suggestion;
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.addEventListener('click', () => {
                chatSearchInput.value = suggestion;
                chatSuggestions.innerHTML = '';
            });
            chatSuggestions.appendChild(suggestionItem);
        });
    }

    function hideScrollbar() {
        const style = document.createElement('style');
        style.textContent = 'body::-webkit-scrollbar { display: none; }';
        document.head.appendChild(style);
    }

    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(e);
        }
    }

    function toggleBookmark(event, post) {
        event.stopPropagation();
        const postContent = post.querySelector('.post-content p').textContent;
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const isBookmarked = bookmarks.includes(postContent);
        if (isBookmarked) {
            bookmarks = bookmarks.filter(content => content !== postContent);
        } else {
            bookmarks.push(postContent);
        }
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        updateBookmarkButton(post, !isBookmarked);
        loadBookmarks(); 
    }

    function updateBookmarkButton(post, isBookmarked) {
        const bookmarkBtn = post.querySelector('.bookmark-btn i');
        if (isBookmarked) {
            bookmarkBtn.classList.add('bookmarked');
        } else {
            bookmarkBtn.classList.remove('bookmarked');
        }
    }

    function loadBookmarks() {
        bookmarksContainer.innerHTML = '';
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        bookmarks.forEach(content => {
            const post = createPost(content);
            bookmarksContainer.appendChild(post);
        });
    }

    const lastSection = localStorage.getItem('lastSection') || 'feed';
    displaySection(lastSection);
});