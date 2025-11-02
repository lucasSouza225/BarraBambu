// Variáveis globais
let menuData = {};
let cart = [];

// Elementos do DOM
const menuContainer = document.getElementById('menu-items-container');
const cartList = document.getElementById('cart-items-list');
const cartTotalItems = document.getElementById('cart-total-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutButton = document.getElementById('checkout-button');
const addressModal = document.getElementById('address-modal');
const addressForm = document.getElementById('address-form');

// Função para carregar os dados do cardápio
async function loadMenuData() {
    try {
        const response = await fetch('js/menu_data.json');
        menuData = await response.json();
        renderMenu();
    } catch (error) {
        console.error('Erro ao carregar os dados do cardápio:', error);
        menuContainer.innerHTML = '<p>Não foi possível carregar o cardápio. Tente novamente mais tarde.</p>';
    }
}

// Função para renderizar o cardápio na tela
function renderMenu() {
    menuContainer.innerHTML = '';
    
    for (const category in menuData) {
        const categorySection = document.createElement('div');
        categorySection.classList.add('category-section');
        
        const title = document.createElement('h3');
        title.textContent = category;
        categorySection.appendChild(title);
        
        menuData[category].forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('menu-item-card');
            
            const details = document.createElement('div');
            details.classList.add('item-details');
            details.innerHTML = `
                <h4>${item.nome}</h4>
                <p>${item.descricao}</p>
            `;
            
            const price = document.createElement('span');
            price.classList.add('item-price');
            price.textContent = `R$ ${item.preco.toFixed(2).replace('.', ',')}`;
            
            const addButton = document.createElement('button');
            addButton.classList.add('add-to-cart-btn');
            addButton.textContent = 'Adicionar';
            addButton.dataset.itemId = item.id;
            addButton.addEventListener('click', () => addItemToCart(item));
            
            itemCard.appendChild(details);
            itemCard.appendChild(price);
            itemCard.appendChild(addButton);
            
            categorySection.appendChild(itemCard);
        });
        
        menuContainer.appendChild(categorySection);
    }
}

// Função para adicionar item ao carrinho
function addItemToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCart();
}

// Função para remover item do carrinho
function removeItemFromCart(itemId) {
    const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
    
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
    }
    
    updateCart();
}

// Função para alterar a quantidade
function changeQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeItemFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// Função para atualizar a visualização do carrinho
function updateCart() {
    cartList.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;
    
    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio.</p>';
        checkoutButton.disabled = true;
    } else {
        cart.forEach(item => {
            const itemTotal = item.preco * item.quantity;
            totalItems += item.quantity;
            totalPrice += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <span>${item.nome}</span>
                    <small>${item.quantity} x R$ ${item.preco.toFixed(2).replace('.', ',')}</small>
                </div>
                <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
            `;
            
            cartList.appendChild(cartItem);
        });
        
        checkoutButton.disabled = false;
    }
    
    cartTotalItems.textContent = `${totalItems} itens`;
    cartTotalPrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    
    // Adicionar listeners para os botões de quantidade
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            changeQuantity(itemId, -1);
        });
    });
    
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = parseInt(e.target.dataset.id);
            changeQuantity(itemId, 1);
        });
    });
}

// Função para abrir o modal de endereço
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    addressModal.style.display = 'block';
});

// Função para fechar o modal de endereço (chamada no onclick do HTML)
window.closeAddressModal = function() {
    addressModal.style.display = 'none';
}

// Função para finalizar o pedido e enviar para o WhatsApp
addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Coletar dados do endereço
    const rua = document.getElementById('address-rua').value;
    const numero = document.getElementById('address-numero').value;
    const bairro = document.getElementById('address-bairro').value;
    const complemento = document.getElementById('address-complemento').value;
    const telefone = document.getElementById('address-telefone').value;

    // 2. Montar a mensagem do pedido
    let message = "Olá! Gostaria de fazer um pedido para entrega:\n\n";
    message += "--- Detalhes do Pedido ---\n";
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.preco * item.quantity;
        total += itemTotal;
        message += `${item.quantity}x - ${item.nome} (R$ ${itemTotal.toFixed(2).replace('.', ',')})\n`;
    });
    
    message += `\nTotal do Pedido: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // 3. Adicionar dados de entrega
    message += "\n\n--- Dados para Entrega ---\n";
    message += `Rua: ${rua}, Nº: ${numero}\n`;
    message += `Bairro: ${bairro}\n`;
    if (complemento) {
        message += `Complemento: ${complemento}\n`;
    }
    message += `Telefone: ${telefone}\n`;
    message += "\nPor favor, confirme a disponibilidade, o valor total (incluindo taxa de entrega) e o prazo.";
    
    // 4. Enviar para o WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '551136340295'; // Número de contato do restaurante
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Fechar o modal e limpar o carrinho (opcional)
    closeAddressModal();
    cart = [];
    updateCart();
});

// Inicialização
document.addEventListener('DOMContentLoaded', loadMenuData);
