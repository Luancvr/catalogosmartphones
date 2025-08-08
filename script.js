// Configuração das planilhas do Google Sheets
// IMPORTANTE: Substitua estas URLs pelas URLs das suas planilhas publicadas como CSV
const SHEET_URLS = {
    0: 'https://docs.google.com/spreadsheets/d/1QIgG7oeHhyIrdlzWAb5jv3Ru_305UJ0xoZniGgQGP9M/export?format=csv&gid=0', // iPhones
    1: 'https://docs.google.com/spreadsheets/d/11XASCJd_fl6B-FPAYND83Xf8wfreLvsCcogHo9Oy5k4/export?format=csv&gid=0' // Androids
};

// Planilha ativa atual
let currentSheetId = 0;

// Dados de exemplo para demonstração (serão usados se a planilha não estiver configurada)
const EXAMPLE_PRODUCTS = [
    {
        Nome: "iPhone 15 Pro",
        Imagem: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300",
        Descricao: "Smartphone premium com câmera profissional",
        Preco: "R$ 7.999,00",
        Parcelas: "12x de R$ 666,58",
        RAM: "8GB",
        Armazenamento: "256GB"
    },
    {
        Nome: "Samsung Galaxy S24",
        Imagem: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300",
        Descricao: "Android flagship com IA avançada",
        Preco: "R$ 5.499,00",
        Parcelas: "10x de R$ 549,90",
        RAM: "12GB",
        Armazenamento: "512GB"
    },
    {
        Nome: "Xiaomi Redmi Note 13",
        Imagem: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
        Descricao: "Custo-benefício excepcional",
        Preco: "R$ 1.299,00",
        Parcelas: "6x de R$ 216,50",
        RAM: "6GB",
        Armazenamento: "128GB"
    }
];

// Função para obter produtos de exemplo baseado na planilha selecionada
function getExampleProducts(sheetId) {
    if (sheetId === 1) {
        // Produtos Android de exemplo
        return [
            {
                Nome: "Samsung Galaxy S24",
                Imagem: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300",
                Descricao: "Android flagship com IA avançada",
                Preco: "R$ 5.499,00",
                Parcelas: "10x de R$ 549,90",
                RAM: "12GB",
                Armazenamento: "512GB"
            },
            {
                Nome: "Xiaomi Redmi Note 13",
                Imagem: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                Descricao: "Custo-benefício excepcional",
                Preco: "R$ 1.299,00",
                Parcelas: "6x de R$ 216,50",
                RAM: "6GB",
                Armazenamento: "128GB"
            },
            {
                Nome: "Google Pixel 8",
                Imagem: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300",
                Descricao: "Android puro com melhor câmera",
                Preco: "R$ 3.999,00",
                Parcelas: "8x de R$ 499,88",
                RAM: "8GB",
                Armazenamento: "256GB"
            }
        ];
    } else {
        // Produtos iPhone de exemplo (planilha 0)
        return EXAMPLE_PRODUCTS;
    }
}

// Função para buscar dados do Google Sheets
async function fetchProductsData(sheetId = currentSheetId) {
    try {
        showLoading(true);
        
        let products = [];
        const sheetUrl = SHEET_URLS[sheetId];
        
        // Primeiro tenta a URL configurada, se falhar usa os dados de exemplo
        try {
            if (sheetUrl && !sheetUrl.includes('SEU_ID_DA_PLANILHA')) {
                const response = await fetch(sheetUrl);
                if (!response.ok) throw new Error('Planilha não encontrada');
                const csvText = await response.text();
                products = parseCSV(csvText);
            } else {
                throw new Error('URL da planilha não configurada');
            }
        } catch (error) {
            console.log('Usando dados de exemplo...');
            products = getExampleProducts(sheetId);
        }
        
        if (products.length === 0) {
            throw new Error('Nenhum produto encontrado');
        }
        
        displayProducts(products);
        showLoading(false);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showError();
        showLoading(false);
    }
}

// Função para converter CSV em array de objetos
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index].trim();
            });
            products.push(product);
        }
    }
    
    return products;
}

// Função para fazer parse de uma linha CSV (lida com vírgulas dentro de aspas)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Função para exibir os produtos na página
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        grid.appendChild(productCard);
    });
}

// Função para criar um card de produto
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Formatação do preço
    const price = formatPrice(product.Preco || product.preco || '');
    const installments = product.Parcelas || product.parcelas || '';
    
    // Especificações
    const ram = product.RAM || product.ram || '';
    const storage = product.Armazenamento || product.armazenamento || product.storage || '';
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.Imagem || product.imagem || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}" 
                 alt="${product.Nome || product.nome || 'Produto'}" 
                 class="product-image"
                 onclick="openLightbox('${product.Imagem || product.imagem}', '${product.Nome || product.nome}')"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'}">
            <div class="specs-overlay">
                ${ram ? `<div class="spec-badge ram"><i class="fas fa-memory"></i> ${ram}</div>` : ''}
                ${storage ? `<div class="spec-badge storage"><i class="fas fa-hdd"></i> ${storage}</div>` : ''}
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.Nome || product.nome || 'Produto sem nome'}</h3>
            <p class="product-description">${product.Descricao || product.descricao || 'Descrição não disponível'}</p>
            <div class="product-price">
                <div class="price-main">${price}</div>
                ${installments ? `<div class="price-installments"><i class="fas fa-credit-card"></i> ${installments}</div>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Função para formatar preço
function formatPrice(priceString) {
    if (!priceString) return 'Preço não informado';
    
    // Se já está formatado, retorna como está
    if (priceString.includes('R$')) return priceString;
    
    // Tenta converter para número e formatar
    const number = parseFloat(priceString.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(number)) return priceString;
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(number);
}

// Função para mostrar/esconder loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('products-grid');
    const error = document.getElementById('error-message');
    
    if (show) {
        loading.style.display = 'block';
        grid.style.display = 'none';
        error.style.display = 'none';
    } else {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }
}

// Função para mostrar erro
function showError() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('products-grid');
    const error = document.getElementById('error-message');
    
    loading.style.display = 'none';
    grid.style.display = 'none';
    error.style.display = 'block';
}

// Função para trocar de planilha
function switchSheet(sheetId) {
    currentSheetId = sheetId;
    
    // Atualizar botões ativos
    document.querySelectorAll('.sheet-selection .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sheet-id="${sheetId}"]`).classList.add('active');
    
    // Carregar dados da nova planilha
    fetchProductsData(sheetId);
}

// Função para inicializar os event listeners dos botões
function initializeSheetButtons() {
    document.querySelectorAll('.sheet-selection .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sheetId = parseInt(btn.getAttribute('data-sheet-id'));
            switchSheet(sheetId);
        });
    });
}

// Função para recarregar dados (pode ser chamada externamente)
function reloadProducts() {
    fetchProductsData();
}

// Exporta funções para uso global
window.reloadProducts = reloadProducts;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeSheetButtons();
    fetchProductsData();
    initializeLightbox();
});

// ===== LIGHTBOX FUNCTIONALITY =====

// Função para abrir o lightbox
function openLightbox(imageSrc, productName) {
    const lightbox = document.getElementById('lightbox');
    const mainImg = document.getElementById('lightbox-main-img');
    
    // Definir a imagem principal
    mainImg.src = imageSrc;
    mainImg.alt = productName;
    
    // Mostrar o lightbox
    lightbox.classList.add('active');
    
    // Buscar imagens relacionadas
    searchRelatedImages(productName);
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
}

// Função para fechar o lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    
    // Restaurar scroll do body
    document.body.style.overflow = 'auto';
    
    // Limpar carrossel
    const carousel = document.getElementById('related-images-carousel');
    carousel.innerHTML = '';
}

// Função para buscar imagens relacionadas
async function searchRelatedImages(productName) {
    const carousel = document.getElementById('related-images-carousel');
    carousel.innerHTML = '<div style="color: #666; padding: 20px;">Buscando mais imagens...</div>';
    
    try {
        // Simular busca de imagens (usando Unsplash como exemplo)
        const searchQuery = encodeURIComponent(productName + ' smartphone');
        const unsplashUrl = `https://source.unsplash.com/featured/200x200/?${searchQuery}`;
        
        // Criar algumas imagens de exemplo (simulando resultados de busca)
        const relatedImages = [];
        for (let i = 1; i <= 6; i++) {
            relatedImages.push({
                src: `https://source.unsplash.com/200x200/?smartphone,phone,mobile,${i}`,
                alt: `${productName} - Imagem ${i}`
            });
        }
        
        // Limpar carrossel e adicionar imagens
        carousel.innerHTML = '';
        
        relatedImages.forEach((img, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.alt = img.alt;
            imgElement.onclick = () => changeMainImage(img.src, img.alt);
            imgElement.style.animationDelay = `${index * 0.1}s`;
            imgElement.style.animation = 'fadeInUp 0.5s ease forwards';
            carousel.appendChild(imgElement);
        });
        
    } catch (error) {
        console.error('Erro ao buscar imagens relacionadas:', error);
        carousel.innerHTML = '<div style="color: #666; padding: 20px;">Não foi possível carregar mais imagens.</div>';
    }
}

// Função para trocar a imagem principal
function changeMainImage(newSrc, newAlt) {
    const mainImg = document.getElementById('lightbox-main-img');
    
    // Efeito de fade
    mainImg.style.opacity = '0.5';
    
    setTimeout(() => {
        mainImg.src = newSrc;
        mainImg.alt = newAlt;
        mainImg.style.opacity = '1';
    }, 200);
}

// Função para inicializar o lightbox
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-btn');
    
    // Fechar ao clicar no X
    closeBtn.addEventListener('click', closeLightbox);
    
    // Fechar ao clicar fora da imagem
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

