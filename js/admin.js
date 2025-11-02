// Variáveis globais para armazenar os dados
let allData = {};

// Elementos do DOM
const menuListContainer = document.getElementById('menu-list-container');
const bannersGrid = document.getElementById('banners-grid');
const galleryGrid = document.getElementById('gallery-grid');

// --- Funções de Utilitário ---

// Simula a escrita de volta no JSON (em um ambiente real, isso seria uma chamada de API)
function saveAllData(data) {
    // Em um ambiente de frontend puro, apenas atualizamos a variável
    // Em um ambiente real, faríamos um POST/PUT para o servidor
    allData = data;
    console.log("Dados salvos (simulado):", allData);
    // Recarregar as visualizações para refletir as mudanças
    renderAdminMenu();
    renderAdminBanners();
    renderAdminGallery();
}

// Simula o carregamento dos dados
async function loadAllData() {
    try {
        const response = await fetch('js/data.json');
        const data = await response.json();
        allData = data;
        renderAdminMenu();
        renderAdminBanners();
        renderAdminGallery();
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        menuListContainer.innerHTML = '<p>Não foi possível carregar os dados de administração.</p>';
    }
}

// --- Gerenciamento do Cardápio ---

function renderAdminMenu() {
    menuListContainer.innerHTML = '';
    const menu = allData.menu;

    const table = document.createElement('table');
    table.classList.add('menu-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Ação</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    for (const category in menu) {
        // Linha da Categoria
        const categoryRow = document.createElement('tr');
        categoryRow.innerHTML = `<td colspan="5" class="category-header">${category}</td>`;
        tbody.appendChild(categoryRow);

        menu[category].forEach(item => {
            const itemRow = document.createElement('tr');
            itemRow.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td>${item.descricao}</td>
                <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                <td><button onclick="deleteMenuItem(${item.id}, '${category}')">Excluir</button></td>
            `;
            tbody.appendChild(itemRow);
        });
    }

    menuListContainer.appendChild(table);
}

window.deleteMenuItem = function(itemId, category) {
    if (!confirm(`Tem certeza que deseja excluir o item ID ${itemId} da categoria ${category}?`)) {
        return;
    }

    const menu = allData.menu;
    
    // Filtra o item a ser removido
    menu[category] = menu[category].filter(item => item.id !== itemId);

    // Se a categoria ficar vazia, remove a categoria (opcional, mas limpa)
    if (menu[category].length === 0) {
        delete menu[category];
    }
    
    // Simula a persistência dos dados
    saveAllData(allData);
}

// --- Gerenciamento de Banners ---

function renderAdminBanners() {
    bannersGrid.innerHTML = '';
    const banners = allData.banners;

    banners.forEach(banner => {
        const card = document.createElement('div');
        card.classList.add('image-card');
        card.innerHTML = `
            <img src="${banner.path}" alt="${banner.alt}">
            <div class="image-card-footer">
                <small>Título: ${banner.title}</small>
                <button onclick="deleteImage('banners', ${banner.id})">Excluir</button>
            </div>
        `;
        bannersGrid.appendChild(card);
    });
}

// --- Gerenciamento da Galeria ---

function renderAdminGallery() {
    galleryGrid.innerHTML = '';
    const gallery = allData.gallery;

    gallery.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('image-card');
        card.innerHTML = `
            <img src="${image.path}" alt="${image.alt}">
            <div class="image-card-footer">
                <small>${image.alt}</small>
                <button onclick="deleteImage('gallery', ${image.id})">Excluir</button>
            </div>
        `;
        galleryGrid.appendChild(card);
    });
}

// --- Funções de Ação Comuns ---

window.deleteImage = function(type, itemId) {
    if (!confirm(`Tem certeza que deseja excluir o item ID ${itemId} da ${type}?`)) {
        return;
    }

    // Filtra o item a ser removido
    allData[type] = allData[type].filter(item => item.id !== itemId);
    
    // Simula a persistência dos dados
    saveAllData(allData);
}

window.simulateUpload = function(type) {
    alert(`A funcionalidade de upload é apenas simulada. Em um projeto real, isso enviaria a imagem para um servidor. O item será adicionado com um caminho de imagem genérico.`);

    let newItem = {};
    let newId = 0;

    // Encontra o próximo ID
    if (allData[type].length > 0) {
        newId = Math.max(...allData[type].map(item => item.id)) + 1;
    } else {
        newId = 1;
    }

    if (type === 'banners') {
        const alt = document.getElementById('banner-alt').value || `Novo Banner ${newId}`;
        const title = document.getElementById('banner-title').value || `Novo Título ${newId}`;
        const subtitle = document.getElementById('banner-subtitle').value || `Novo Subtítulo`;
        newItem = {
            "id": newId,
            "path": "img/carousel-1.jpg", // Imagem genérica para simulação
            "alt": alt,
            "title": title,
            "subtitle": subtitle
        };
    } else if (type === 'gallery') {
        const alt = document.getElementById('gallery-alt').value || `Nova Foto ${newId}`;
        newItem = {
            "id": newId,
            "path": "img/gallery-1.jpg", // Imagem genérica para simulação
            "alt": alt
        };
    }

    if (Object.keys(newItem).length > 0) {
        allData[type].push(newItem);
        saveAllData(allData);
        alert(`Novo item ID ${newId} adicionado (simulado) à ${type}.`);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', loadAllData);
