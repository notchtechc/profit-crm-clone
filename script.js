let currentUser = null;
let isLoggedIn = false;
let systemSettings = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Load system settings first
    loadSystemSettings();
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Initialize login form if exists
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize dashboard if exists
    if (document.querySelector('.dashboard')) {
        initializeDashboard();
    }
    
    // Apply global settings if function exists
    if (typeof applyGlobalSettings === 'function') {
        applyGlobalSettings();
    }
}

// Load system settings
function loadSystemSettings() {
    const savedSettings = localStorage.getItem('crmSettings');
    if (savedSettings) {
        systemSettings = JSON.parse(savedSettings);
        applySystemSettings();
    }
}

// Apply system settings globally
function applySystemSettings() {
    if (!systemSettings) return;
    
    // Apply branding
    updateGlobalBranding();
    
    // Apply colors
    updateGlobalColors();
    
    // Apply language settings
    updateLanguageSettings();
}

// Update global branding
function updateGlobalBranding() {
    if (!systemSettings?.branding) return;
    
    const { companyName, systemBadge } = systemSettings.branding;
    
    // Update all logo elements
    const logoElements = document.querySelectorAll('.vice-logo span:first-child, #systemName, #mobileSysName');
    logoElements.forEach(el => {
        if (el) el.textContent = companyName;
    });
    
    const badgeElements = document.querySelectorAll('.crm-badge, #systemBadge, #mobileSysBadge');
    badgeElements.forEach(el => {
        if (el) el.textContent = systemBadge;
    });
    
    // Update page titles
    if (systemSettings.general?.systemName) {
        const currentTitle = document.title;
        const newTitle = currentTitle.replace(/Vice CRM|Profit CRM/, `${companyName} ${systemBadge}`);
        document.title = newTitle;
    }
}

// Update global colors
function updateGlobalColors() {
    if (!systemSettings?.branding) return;
    
    const { primaryColor, secondaryColor, backgroundColor } = systemSettings.branding;
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--background-color', backgroundColor);
    
    // Update specific elements with gradients
    updateGradientElements(primaryColor, secondaryColor);
}

// Update gradient elements
function updateGradientElements(primaryColor, secondaryColor) {
    const gradientSelectors = [
        '.login-page',
        '.group-icon',
        '.card-icon',
        '.login-btn',
        '.btn-primary'
    ];
    
    gradientSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.style.background && el.style.background.includes('gradient')) {
                el.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
            }
        });
    });
}

// Update language settings
function updateLanguageSettings() {
    if (!systemSettings?.general) return;
    
    const { defaultLanguage } = systemSettings.general;
    
    // Update HTML lang attribute
    document.documentElement.lang = defaultLanguage;
    
    // Update direction for RTL languages
    if (defaultLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
}

// Check login status
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        
        // If on login page and already logged in, redirect to dashboard
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If not on login page and not logged in, redirect to login
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> جاري تسجيل الدخول...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Validate credentials (in real app, this would be server-side)
        if (email === 'mahmoud2@kmg.com' && password === '12345678') {
            // Successful login
            currentUser = {
                email: email,
                name: 'محمود',
                role: 'مدير المبيعات',
                loginTime: new Date().toISOString(),
                rememberMe: remember
            };
            
            // Always save to localStorage for session management
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Also save to sessionStorage for temporary sessions
            sessionStorage.setItem('userLoggedIn', 'true');
            
            isLoggedIn = true;
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Invalid credentials
            showError('بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.');
        }
    } catch (error) {
        showError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show error message
function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 12px 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        border: 1px solid #f5c6cb;
        font-size: 0.9rem;
    `;
    errorDiv.textContent = message;
    
    // Insert before login form
    const loginForm = document.getElementById('loginForm');
    loginForm.parentNode.insertBefore(errorDiv, loginForm);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Initialize dashboard
function initializeDashboard() {
    // Update user info
    updateUserInfo();
    
    // Initialize mobile sidebar
    initializeMobileSidebar();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize search functionality
    initializeSearch();
    
    // Load dashboard data
    loadDashboardData();
}

// Update user information in dashboard
function updateUserInfo() {
    if (currentUser) {
        const userNameElements = document.querySelectorAll('.user-info span');
        userNameElements.forEach(element => {
            if (element.textContent.includes('مرحباً')) {
                element.textContent = `مرحباً، ${currentUser.name}`;
            }
        });
        
        const userAvatars = document.querySelectorAll('.user-avatar');
        userAvatars.forEach(avatar => {
            avatar.textContent = currentUser.name.charAt(0);
        });
    }
}

// Initialize mobile sidebar
function initializeMobileSidebar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle && mobileSidebar) {
        menuToggle.addEventListener('click', toggleMobileSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleMobileSidebar);
    }
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileSidebar && sidebarOverlay) {
        mobileSidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        if (mobileSidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

// Show tooltip
function showTooltip(event) {
    const element = event.target;
    const title = element.getAttribute('title');
    
    if (title) {
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = title;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        
        // Store reference
        element._tooltip = tooltip;
        
        // Remove title to prevent default tooltip
        element.removeAttribute('title');
        element._originalTitle = title;
    }
}

// Hide tooltip
function hideTooltip(event) {
    const element = event.target;
    if (element._tooltip) {
        element._tooltip.remove();
        element._tooltip = null;
    }
    
    if (element._originalTitle) {
        element.setAttribute('title', element._originalTitle);
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchButtons = document.querySelectorAll('.action-btn[title="البحث"]');
    searchButtons.forEach(button => {
        button.addEventListener('click', toggleSearch);
    });
}

// Toggle search
function toggleSearch() {
    // Create search overlay
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box-overlay';
    searchBox.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
    `;
    
    searchBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>البحث في النظام</h3>
            <button onclick="this.closest('.search-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <input type="text" placeholder="ابحث عن العملاء، المشاريع، التقارير..." style="width: 100%; padding: 15px; border: 2px solid #e1e5e9; border-radius: 8px; font-family: 'Cairo', sans-serif;">
        <div style="margin-top: 15px;">
            <button onclick="performSearch()" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-family: 'Cairo', sans-serif;">
                <i class="fas fa-search"></i> بحث
            </button>
        </div>
    `;
    
    searchOverlay.appendChild(searchBox);
    document.body.appendChild(searchOverlay);
    
    // Focus on input
    const input = searchBox.querySelector('input');
    input.focus();
    
    // Close on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchOverlay.remove();
        }
    });
    
    // Close on overlay click
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            searchOverlay.remove();
        }
    });
}

// Perform search
function performSearch() {
    const searchInput = document.querySelector('.search-box-overlay input');
    const query = searchInput.value.trim();
    
    if (query) {
        // In a real app, this would make an API call
        console.log('البحث عن:', query);
        
        // Show search results (mock)
        showSearchResults(query);
    }
}

// Show search results
function showSearchResults(query) {
    const searchOverlay = document.querySelector('.search-overlay');
    const searchBox = searchOverlay.querySelector('.search-box-overlay');
    
    searchBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>نتائج البحث عن: "${query}"</h3>
            <button onclick="this.closest('.search-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
            <div style="padding: 15px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 10px;">
                <h4>أستاذة منيرة</h4>
                <p style="color: #6c757d; margin: 5px 0;">عميل - وحدة سكنية</p>
                <small style="color: #6c757d;">رقم الهاتف: 201001003448</small>
            </div>
            <div style="padding: 15px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 10px;">
                <h4>بدون اسم</h4>
                <p style="color: #6c757d; margin: 5px 0;">عميل - وحدة تجارية</p>
                <small style="color: #6c757d;">رقم الهاتف: 201033878951</small>
            </div>
            <div style="text-align: center; padding: 20px; color: #6c757d;">
                تم العثور على 2 نتيجة
            </div>
        </div>
    `;
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading dashboard data
    const groupCards = document.querySelectorAll('.group-card');
    
    // Add loading animation
    groupCards.forEach(card => {
        card.style.opacity = '0.7';
    });
    
    // Simulate API call
    setTimeout(() => {
        groupCards.forEach(card => {
            card.style.opacity = '1';
        });
        
        // Update counts with animation
        animateCounters();
    }, 1000);
}

// Animate counters
function animateCounters() {
    const countElements = document.querySelectorAll('.group-count');
    
    countElements.forEach(element => {
        const text = element.textContent;
        const match = text.match(/\d+/);
        
        if (match) {
            const finalCount = parseInt(match[0]);
            let currentCount = 0;
            const increment = Math.ceil(finalCount / 20);
            
            const timer = setInterval(() => {
                currentCount += increment;
                if (currentCount >= finalCount) {
                    currentCount = finalCount;
                    clearInterval(timer);
                }
                element.textContent = text.replace(/\d+/, currentCount);
            }, 50);
        }
    });
}

// Navigate to leads page
function navigateToLeads(leadType) {
    // Store selected lead type
    localStorage.setItem('selectedLeadType', leadType);
    
    // Navigate to leads page
    window.location.href = 'leads.html';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    isLoggedIn = false;
    window.location.href = 'index.html';
}

// Add logout functionality to settings button
document.addEventListener('DOMContentLoaded', function() {
    const settingsButtons = document.querySelectorAll('.action-btn[title="الإعدادات"]');
    settingsButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                logout();
            }
        });
    });
});

// Handle responsive navigation
function handleResponsiveNav() {
    const mainNav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768) {
        if (mainNav) mainNav.style.display = 'none';
        if (menuToggle) menuToggle.style.display = 'block';
    } else {
        if (mainNav) mainNav.style.display = 'flex';
        if (menuToggle) menuToggle.style.display = 'none';
        
        // Close mobile sidebar if open
        const mobileSidebar = document.getElementById('mobileSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (mobileSidebar) mobileSidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Handle window resize
window.addEventListener('resize', handleResponsiveNav);

// Initialize responsive nav on load
document.addEventListener('DOMContentLoaded', handleResponsiveNav);

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        z-index: 3000;
        font-family: 'Cairo', sans-serif;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Apply global settings function
function applyGlobalSettings() {
    // Load and apply system settings
    loadSystemSettings();
}

// Export functions for global use
window.navigateToLeads = navigateToLeads;
window.toggleMobileSidebar = toggleMobileSidebar;
window.performSearch = performSearch;
window.logout = logout;
window.showNotification = showNotification;
window.applyGlobalSettings = applyGlobalSettings;
