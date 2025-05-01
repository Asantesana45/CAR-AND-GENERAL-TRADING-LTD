// Initialize Local Storage for Cart, Wishlist, and Subscriptions
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let compareList = [];
let user = JSON.parse(localStorage.getItem('user')) || null;
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];


// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');


themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
});


// Smooth Scroll for Navigation Links
document.querySelectorAll('.navbar-nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
    });
});


// Welcome Popup for First-Time Visitors
if (!localStorage.getItem('visited')) {
    setTimeout(() => {
        const welcomePopup = new bootstrap.Modal(document.getElementById('welcomePopup'));
        welcomePopup.show();
        localStorage.setItem('visited', 'true');
    }, 2000);
}


// Stats Counter Animation
const statValues = document.querySelectorAll('.stat-value');
const animateStats = () => {
    statValues.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let count = 0;
        const increment = target / 100;
        const updateCount = () => {
            count += increment;
            if (count >= target) {
                stat.textContent = target;
            } else {
                stat.textContent = Math.ceil(count);
                requestAnimationFrame(updateCount);
            }
        };
        updateCount();
    });
};


const statsSection = document.querySelector('.stats-section');
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateStats();
        observer.disconnect();
    }
}, { threshold: 0.5 });
observer.observe(statsSection);


// Currency Converter
const currencySelector = document.getElementById('currency-selector');
const exchangeRates = {
    KES: 1,
    USD: 0.0078, // 1 KES = 0.0078 USD (example rate)
    EUR: 0.0073  // 1 KES = 0.0073 EUR (example rate)
};


currencySelector.addEventListener('change', () => {
    const currency = currencySelector.value;
    const prices = document.querySelectorAll('.price');
    prices.forEach(price => {
        const basePrice = parseInt(price.getAttribute('data-base-price'));
        const convertedPrice = (basePrice * exchangeRates[currency]).toFixed(2);
        price.textContent = `${currency} ${convertedPrice}`;
    });
});


// Product Filter, Sort, and Search
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
const productItems = document.querySelectorAll('.product-item');
let productArray = Array.from(productItems);


searchBar.addEventListener('input', updateProducts);
categoryFilter.addEventListener('change', updateProducts);
sortFilter.addEventListener('change', updateProducts);


function updateProducts() {
    const searchText = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortOption = sortFilter.value;


    // Filter by search and category
    let filteredItems = productArray.filter(item => {
        const productName = item.querySelector('.product-details h3').textContent.toLowerCase();
        const productCategory = item.getAttribute('data-category');


        const matchesSearch = productName.includes(searchText);
        const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;


        return matchesSearch && matchesCategory;
    });


    // Sort items
    if (sortOption === 'price-asc') {
        filteredItems.sort((a, b) => parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price')));
    } else if (sortOption === 'price-desc') {
        filteredItems.sort((a, b) => parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price')));
    }


    // Update DOM
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '';
    filteredItems.forEach(item => productGrid.appendChild(item));
}


// Shopping Cart Functionality
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');


document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));
        cart.push({ name, price });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        trackEvent('add_to_cart', { name, price });
    });
});


function updateCart() {
    cartCount.textContent = cart.length;
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.name} - KES ${item.price.toLocaleString()}</span>
                <button class="btn btn-sm btn-danger remove-from-cart" data-index="${index}">Remove</button>
            </div>
        `).join('');
    }


    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        });
    });
}


updateCart();


// Wishlist Functionality
const wishlistItems = document.getElementById('wishlist-items');
const wishlistCount = document.getElementById('wishlist-count');


document.querySelectorAll('.add-to-wishlist').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));
        if (!wishlist.some(item => item.name === name)) {
            wishlist.push({ name, price });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlist();
            trackEvent('add_to_wishlist', { name, price });
        }
    });
});


function updateWishlist() {
    wishlistCount.textContent = wishlist.length;
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p>Your wishlist is empty.</p>';
    } else {
        wishlistItems.innerHTML = wishlist.map((item, index) => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.name} - KES ${item.price.toLocaleString()}</span>
                <button class="btn btn-sm btn-danger remove-from-wishlist" data-index="${index}">Remove</button>
            </div>
        `).join('');
    }


    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            wishlist.splice(index, 1);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlist();
        });
    });
}


updateWishlist();


// Product Comparison Functionality
const compareItems = document.getElementById('compare-items');
const maxCompareItems = 3;


document.querySelectorAll('.add-to-compare').forEach(button => {
    button.addEventListener('click', () => {
        if (compareList.length >= maxCompareItems) {
            alert(`You can compare up to ${maxCompareItems} products at a time.`);
            return;
        }


        const name = button.getAttribute('data-name');
        const price = parseInt(button.getAttribute('data-price'));
        const description = button.getAttribute('data-description');
        const image = button.getAttribute('data-image');


        if (!compareList.some(item => item.name === name)) {
            compareList.push({ name, price, description, image });
            updateCompareList();
            const compareModal = new bootstrap.Modal(document.getElementById('compareModal'));
            compareModal.show();
            trackEvent('add_to_compare', { name, price });
        }
    });
});


function updateCompareList() {
    compareItems.innerHTML = compareList.map((item, index) => `
        <div class="col-md-4 compare-item">
            <img src="${item.image}" alt="${item.name}">
            <h5>${item.name}</h5>
            <p>Price: KES ${item.price.toLocaleString()}</p>
            <p>${item.description}</p>
            <button class="btn btn-sm btn-danger remove-from-compare" data-index="${index}">Remove</button>
        </div>
    `).join('');


    document.querySelectorAll('.remove-from-compare').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            compareList.splice(index, 1);
            updateCompareList();
        });
    });
}


// Quick View Modal with Gallery
document.querySelectorAll('.quick-view').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        const image = button.getAttribute('data-image');
        const description = button.getAttribute('data-description');
        const gallery = JSON.parse(button.getAttribute('data-gallery'));


        document.getElementById('quick-view-name').textContent = name;
        document.getElementById('quick-view-price').textContent = `KES ${parseInt(price).toLocaleString()}`;
        document.getElementById('quick-view-image').src = image;
        document.getElementById('quick-view-description').textContent = description;


        const addToCartButton = document.getElementById('quick-view-add-to-cart');
        addToCartButton.setAttribute('data-name', name);
        addToCartButton.setAttribute('data-price', price);


        const addToWishlistButton = document.getElementById('quick-view-add-to-wishlist');
        addToWishlistButton.setAttribute('data-name', name);
        addToWishlistButton.setAttribute('data-price', price);


        // Populate gallery thumbnails
        const galleryThumbnails = document.querySelector('.gallery-thumbnails');
        galleryThumbnails.innerHTML = gallery.map((img, index) => `
            <img src="${img}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}">
        `).join('');


        galleryThumbnails.querySelectorAll('img').forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                galleryThumbnails.querySelectorAll('img').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
                document.getElementById('quick-view-image').src = thumbnail.src;
            });
        });
    });
});


// User Authentication
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');


loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    // Simulated authentication (replace with actual backend)
    user = { email, name: email.split('@')[0] };
    localStorage.setItem('user', JSON.stringify(user));
    alert(`Welcome back, ${user.name}!`);
    bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    trackEvent('login', { email });
});


signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    // Simulated signup (replace with actual backend)
    user = { name, email };
    localStorage.setItem('user', JSON.stringify(user));
    alert(`Welcome, ${user.name}! You have successfully signed up.`);
    bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    trackEvent('signup', { email, name });
});


// Live Chat Functionality
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatSend = document.getElementById('chat-send');
const chatInput = document.getElementById('chat-input');
const chatBody = document.getElementById('chat-body');


chatToggle.addEventListener('click', () => {
    chatWindow.style.display = 'block';
    trackEvent('open_chat');
});


chatClose.addEventListener('click', () => {
    chatWindow.style.display = 'none';
});


chatSend.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        const messageElement = document.createElement('p');
        messageElement.textContent = `You: ${message}`;
        chatBody.appendChild(messageElement);
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;


        // Simulated response (replace with backend integration)
        setTimeout(() => {
            const responseElement = document.createElement('p');
            responseElement.textContent = `Support: Thanks for your message! How can we assist you today?`;
            chatBody.appendChild(responseElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
        trackEvent('send_chat_message', { message });
    }
});


chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        chatSend.click();
    }
});


// Newsletter Form Validation (Both Welcome Popup and Footer)
const newsletterForms = [document.getElementById('newsletter-form'), document.getElementById('welcome-newsletter-form')];
newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const messageDiv = form.querySelector('#newsletter-message') || document.getElementById('newsletter-message');
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (emailRegex.test(email)) {
            subscriptions.push(email);
            localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
            messageDiv.textContent = 'Thank you for subscribing!';
            messageDiv.classList.remove('text-danger');
            messageDiv.classList.add('text-success');
            emailInput.value = '';
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 3000);
            trackEvent('subscribe_newsletter', { email });
        } else {
            messageDiv.textContent = 'Please enter a valid email address.';
            messageDiv.classList.remove('text-success');
            messageDiv.classList.add('text-danger');
        }
    });
});


// Back to Top Button
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.style.display = 'block';
    } else {
        backToTop.style.display = 'none';
    }
});


backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// Analytics Tracking (Simulated)
function trackEvent(eventName, data = {}) {
    console.log(`Event: ${eventName}`, data);
    // Replace with actual analytics integration (e.g., Google Analytics)
}