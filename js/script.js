// Variáveis globais
let allData = {};
let currentSlide = 0;

// Elementos do DOM
const carouselInner = document.querySelector('.carousel-inner');
const galleryGrid = document.querySelector('.gallery-grid');
const reservationForm = document.getElementById('reservationForm');

// --- Funções de Utilitário ---

async function loadAllData() {
    try {
        const response = await fetch('js/data.json');
        allData = await response.json();
        
        // Renderiza as partes dinâmicas
        renderCarousel();
        renderGallery();

        // Inicializa o carrossel após a renderização
        showSlide(0);
        
        // Inicializa o auto-rotate do carrossel
        setInterval(() => {
            changeSlide(1);
        }, 5000);
        
        // Inicializa as animações de scroll
        initializeScrollAnimations();

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// --- Carrossel ---

function renderCarousel() {
    if (!carouselInner) return;
    carouselInner.innerHTML = '';
    allData.banners.forEach((banner, index) => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');
        item.innerHTML = `
            <img src="${banner.path}" alt="${banner.alt}">
            <div class="carousel-caption">
                <h2>${banner.title}</h2>
                <p>${banner.subtitle}</p>
            </div>
        `;
        carouselInner.appendChild(item);
    });
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-item');
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    // Remove a classe 'active' de todos os slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Garante que o índice está dentro do intervalo válido
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }
    
    // Adiciona a classe 'active' ao slide atual
    slides[currentSlide].classList.add('active');
}

window.changeSlide = function(direction) {
    showSlide(currentSlide + direction);
}

// --- Galeria ---

function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    // Combina galeria e promoções para a seção de galeria do index.html
    const images = [...allData.gallery, ...allData.promo];
    
    images.forEach(image => {
        const item = document.createElement('div');
        item.classList.add('gallery-item');
        item.innerHTML = `
            <img src="${image.path}" alt="${image.alt}">
        `;
        galleryGrid.appendChild(item);
    });
    
    // Re-adiciona o evento de lightbox após a renderização
    initializeLightbox();
}

// --- Reserva (Mantido do original) ---

if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coleta os dados do formulário
        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const people = document.getElementById('people').value;
        const contact = document.getElementById('contact').value;
        
        // Validação básica
        if (!name || !date || !time || !people || !contact) {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        
        // Formata a mensagem para WhatsApp
        const message = `Olá! Gostaria de fazer uma reserva:\n\nNome: ${name}\nData: ${date}\nHora: ${time}\nNúmero de pessoas: ${people}\nContato: ${contact}`;
        
        // Codifica a mensagem para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Abre o WhatsApp (você pode substituir o número pelo número real do restaurante)
        const whatsappNumber = '5511936340295'; // Exemplo: número com código do país e DDD
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Abre em nova aba
        window.open(whatsappUrl, '_blank');
        
        // Limpa o formulário
        reservationForm.reset();
        
        // Mostra uma mensagem de sucesso
        alert('Redirecionando para WhatsApp...');
    });
}

// --- Lightbox/Modal (Mantido do original) ---
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!lightbox || !lightboxImg) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            lightbox.style.display = 'block';
            lightboxImg.src = imgSrc;
        });
    });

    window.closeLightbox = function() {
        lightbox.style.display = 'none';
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
}

// --- Animações de Scroll (Mantido do original) ---
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observa elementos com animação
    const animatedElements = document.querySelectorAll('.menu-item, .promo-card, .gallery-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', loadAllData);
