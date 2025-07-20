// js/modules/utils.js
const Utils = (function() {
    let notificationContainer;
    
    function createNotificationContainer() {
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(notificationContainer);
        }
        return notificationContainer;
    }
    
    function notify(message, type = 'success', duration = 5000) {
        const container = createNotificationContainer();
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 320px;
        `;
        notification.innerHTML = message;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    function showModal(title, inputPlaceholder = '') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3>${title}</h3>
                    <input type="text" class="modal-input" placeholder="${inputPlaceholder}" />
                    <div class="modal-buttons">
                        <button class="btn-cancel">Cancel</button>
                        <button class="btn-confirm">Confirm</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            const input = overlay.querySelector('.modal-input');
            const btnCancel = overlay.querySelector('.btn-cancel');
            const btnConfirm = overlay.querySelector('.btn-confirm');
            
            input.focus();
            
            function close(value) {
                overlay.remove();
                resolve(value);
            }
            
            btnCancel.addEventListener('click', () => close(null));
            btnConfirm.addEventListener('click', () => close(input.value));
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') close(input.value);
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(null);
            });
        });
    }
    
    // Public API
    return {
        notify,
        showModal
    };
})();